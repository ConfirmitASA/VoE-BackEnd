class PulseProgramUtil {

    static public var pulseSurveyContentInfo = {};

    static public var pulseSurveyContentBaseValues = {};

    /**
     * list of properties of survey or report page that are based on questions and/or categories
     */
    static private var resourcesDependentOnSpecificSurvey = {

        Survey: ['FiltersFromSurveyData'],
        Page_KPI: ['KPI', 'KPIQuestionsToFilterVerbatim'],
        Page_Trends: ['TrendQuestions'],
        Page_Results: ['BreakVariables'],
        Page_Comments: ['Comments', 'ScoresForComments', 'TagsForComments', 'BreakVariables', {type: 'QuestionsCategory', propertyWithCat: 'CustomCommentCategory'}],
        Page_Categorical_: ['ResultCategoricalQuestions', 'ResultMultiCategoricalQuestions'],
        Page_CategoricalDrilldown: ['BreakVariables'],
        Page_Response_Rate: ['DemographicsQuestions']
    }

    /**
     *
     */
    static private function buildQuestionCategoryId(context, pageId, pageProperty) {

        var log = context.log;

        if(typeof pageProperties[i] === 'object' && pageProperties[i].type === 'QuestionsCategory') {
            var category = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, pageProperty);
            return QuestionUtil.getQuestionIdsByCategory(context, category);
        } else {
            return DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, pageProperty);
        }

        throw new Error('PulseProgramUtil.buildQuestionCategoryId: couldn\'t build id list for property '+pageProperty+' on page '+pageId);
    }

    /**
     * creates array of qids and category ids that need to be checked against pulse baby survey on current page
     * array item is an object {ItemCode : ItemType}, ItemType can be QuestionId or CategorizationId, ItemCode - id iteslf
     * @param {Object} context
     * @returns {Array} object where property is resourceId (question or dimension) and value is its type
     */
    static private function getResourcesList (context) {

        var log = context.log;
        var listOfResources = [];
        var resources = [];
        var resourcesLog = {};
        var i;
        var surveyProperties = resourcesDependentOnSpecificSurvey['Survey'];
        var pageId = PageUtil.getCurrentPageIdInConfig (context);
        var pageProperties = resourcesDependentOnSpecificSurvey[pageId];

        // keep property values in array
        for(i=0; i<surveyProperties.length; i++) {
            listOfResources=listOfResources.concat(DataSourceUtil.getSurveyPropertyValueFromConfig (context, surveyProperties[i]));
        }

        for(i=0; i<pageProperties.length; i++) {
            listOfResources=listOfResources.concat(buildQuestionCategoryId(context, pageId, pageProperties[i]));
        }

        //remove duplicates and format
        for(i=0; i<listOfResources.length; i++) {
            var item = listOfResources[i];
            var code;
            var type;

            if(typeof item === 'string') {
                code = item;
                type = 'QuestionId';
            } else { //dimension
                code = item.Code;
                type = item.Type;
            }

            if(code && !resourcesLog.hasOwnProperty(code)) {
                resources.push({Code: code, Type: type});
                resourcesLog[code] = true;
            }
        }

        return resources;
    }

    /**
     * pushes resources list into 'cache' (static var) with key = enduserEmail_pageId (to avoid end user data conflicts)
     * @param {Object} context
     * @returns {Array} object where property is resourceId (question or dimension) and value is its type
     */
    static public function setPulseSurveyContentInfo (context) {

        var log = context.log;
        var key = getKeyForPulseSurveyContentInfo(context);

        delete pulseSurveyContentInfo.key;
        pulseSurveyContentInfo[key] = getResourcesList(context);

        return;
    }

    /**
     * save base values of needed items in pulseSurveyContentBaseValues[key] array
     * it matches pulseSurveyContentInfo[key] exactly
     * @param {Object} context
     */
    static public function setPulseSurveyContentBaseValues (context) {

        var log = context.log;
        //log.LogDebug('setPulseSurveyContentBaseValues start')
        var key = getKeyForPulseSurveyContentInfo(context);
        var report = context.report;

        var resourcesBase : Datapoint[];
        var baseValues = [];

        if(!pulseSurveyContentInfo[key]) {
            throw new Error('PulseProgramUtil.setPulseSurveyContentBaseValues: pulseSurveyContentInfo['+key+'] does not exist.');
        }

        if(pulseSurveyContentInfo[key].length === 0) {
            resourcesBase = [];
        } else {
            //log.LogDebug('request to pulse table start')
            resourcesBase = report.TableUtils.GetColumnValues('PulseSurveyData:PulseSurveyContentInfo', 1);
            //log.LogDebug('request to pulse table end')
        }

        for(var i=0; i< resourcesBase.length; i++) {
            var baseVal: Datapoint = resourcesBase[i];
            baseValues.push(baseVal.Value);
        }

        // remove old value as it might have changed if new data appeared
        delete pulseSurveyContentBaseValues.key;
        pulseSurveyContentBaseValues[key] = baseValues;


        //log.LogDebug('setPulseSurveyContentBaseValues end')

        return;
    }

    /**
     * create key for 'cache', need because static vars are shared among end users
     * @param {Object} context
     * @returns {string} key
     */
    static public function getKeyForPulseSurveyContentInfo(context) {

        var log = context.log;
        var currentPage = PageUtil.getCurrentPageIdInConfig (context);
        var pageContext = context.pageContext;
        var key = pageContext.Items['userEmail']+'_'+currentPage;

        return key;
    }

    /**
     * @param {Object} context
     * @returns {Object} resourcesWithData - object {resourceId: resourceType} - only those that have data
     */
    static public function getPulseSurveyContentInfo_ItemsWithData (context) {

        var log = context.log;
        //log.LogDebug('getPulseSurveyContentInfo_ItemsWithData start')
        var key = getKeyForPulseSurveyContentInfo(context);
        var resources = pulseSurveyContentInfo[key];
        var resourcesBase = pulseSurveyContentBaseValues[key];
        var resourcesWithData = {};

        //log.LogDebug(JSON.stringify(pulseSurveyContentInfo))
        //log.LogDebug(JSON.stringify(pulseSurveyContentBaseValues))

        if(resources.length > resourcesBase.length) {
            setPulseSurveyContentBaseValues(context);
            var resourcesBase = pulseSurveyContentBaseValues[key];
        }

        for(var i=0; i< resourcesBase.length; i++) {
            if(resourcesBase[i]>0) {
                resourcesWithData[resources[i].Code] = { Type: resources[i].Type};
            }
        }
        //log.LogDebug('getPulseSurveyContentInfo_ItemsWithData end')

        return resourcesWithData;
    }

    /**
     * Recieves full list of options and exclude from it those without answers
     * @param {Object} context
     * @param {Array} list of options
     * @returns {Array} options with answers
     */
    static public function excludeItemsWithoutData(context, allOptions) {

        var log = context.log;

        //log.LogDebug('excludeItemsWithoutData start '+JSON.stringify(allOptions))
        var key = getKeyForPulseSurveyContentInfo(context);
        var resources = pulseSurveyContentInfo.hasOwnProperty(key) && pulseSurveyContentInfo[key];

        //not pulse program or there's nothing to exclude on this page
        if(DataSourceUtil.isProjectSelectorNotNeeded(context) || !resources || resources.length === 0) {
            return allOptions;
        }
        
        var availableCodes = getPulseSurveyContentInfo_ItemsWithData(context);        
        var optionsWithData = [];

        for(var i=0; i<allOptions.length; i++) {
            // options can be a list of objects with code property or just a list of codes
            if(typeof allOptions[i] === 'object' && availableCodes.hasOwnProperty(allOptions[i].Code)) {
                optionsWithData.push(allOptions[i]);
            } else if (typeof allOptions[i] === 'string' && availableCodes.hasOwnProperty(allOptions[i])) {
                optionsWithData.push(allOptions[i]);
            }
        }

        //log.LogDebug('excludeItemsWithoutData end')
        return optionsWithData;
    }

    /**
     * Debug function that prints PulseSurveyContentInfo into log
     * @param {Object} context
     */
    static public function printPulseSurveyContentInfoTable (context) {

        var log = context.log;
        var report = context.report;
        var key = getKeyForPulseSurveyContentInfo(context);

        if(pulseSurveyContentInfo.hasOwnProperty(key) && pulseSurveyContentInfo[key].length>0) {

            var resourcesBase = pulseSurveyContentBaseValues[key];
            var resources = pulseSurveyContentInfo[key];
            var resourcesData = {};

            for(var i=0; i< resources.length; i++) {
                resourcesData[resources[i].Code] = { Value: resourcesBase[i]};
            }

            log.LogDebug('Data from PulseSurveyContentInfo table: '+JSON.stringify(resourcesData));
        } else {
            log.LogDebug('Data from PulseSurveyContentInfo table: no data');
        }

    }

    /**
     * hide script for ShowAll checkbox - ability to see not only own surveys
     * @param {Object} context
     */
    static public function isShowAllNotVisible(context) {

        var log = context.log;

        if(DataSourceUtil.isProjectSelectorNotNeeded(context)) {
            return true;
        }

        var PulseSurveyData = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'PulseSurveyData');
        var roles = PulseSurveyData.hasOwnProperty('showAllVisibleForRoles') && PulseSurveyData['showAllVisibleForRoles'];
        var user = context.user;

        if(!roles) {
            return true;
        }

    }
}
