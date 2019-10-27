class ParamUtil {

    /*
  * Object with resources (values) for parameters.
  * - propertyName: name of property (the lowest level of the path so to say) that keeps the value
  * - type (type of data): StaticArrayofObjects (static array text values in format {Code: code, Label: label}), QuestionList (array of question ids), QuestionId (sring with questionId)
  * - locationType (where data is stored): TextAndParameterLibrary (as is), Page (in page property), Survey (in survey property), Report (general report property in Config)
  * - page: when locationType is 'Page' this property specifies pageId
  */

    static var reportParameterValuesMap = {

        'p_projectSelector': { type: 'PulseSurveyInfo', locationType: 'Survey', propertyName: 'PulseSurveyData'},

        'p_Results_CountsPercents':   { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'Distribution'},
        'p_Results_TableTabSwitcher': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ResultsTabSwitcher'},
        'p_TimePeriod':               { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimePeriods'},
        'p_TimeUnitWithDefault':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsWithDefaultValue'},
        'p_TimeUnitNoDefault':        { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_CatDD_TimeUnitNoDefault':  { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_DisplayMode':              { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'DisplayMode'},
        'p_ShowAllPulseSurveys':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ShowAllPulseSurveys'},

        'p_Results_BreakBy':      { type: 'QuestionList', locationType: 'Page', page: 'Page_Results',              propertyName: 'BreakVariables'},
        'p_CategoricalDD_BreakBy':{ type: 'QuestionList', locationType: 'Page', page: 'Page_CategoricalDrilldown', propertyName: 'BreakVariables'},
        'p_ResponseRate_BreakBy': { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'BreakVariables'},
        'p_Demographics':         { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'DemographicsQuestions'},
        'p_OpenTextQs':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'Comments'},
        'p_CustomOpenTextQs':     { type: 'CustomQuestionList',  locationType: 'QuestionCategory', page: 'Page_Comments',  propertyName: 'CustomCommentCategory'},
        'p_AllOpenTextQs':        { type: 'ParameterOptionList', locationType: 'CombinationOfParameters',          parameterList: ['p_OpenTextQs', 'p_CustomOpenTextQs']},
        'p_ScoreQs':              { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'ScoresForComments'},
        'p_TagQs':                { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'TagsForComments'},
        'p_QsToFilterBy':         { type: 'QuestionList', locationType: 'Page', page: 'Page_KPI',                  propertyName: 'KPIQuestionsToFilterVerbatim'},
        'p_Statements':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Actions',              propertyName: 'Statements'},

        'p_BenchmarkSet': { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Results', propertyName: 'BenchmarkSet'},
        'p_Dimensions':   { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Actions', propertyName: 'Dimensions'},

        'p_TrendQs': { type: 'QuestionAndCategoriesList', locationType: 'Page', page: 'Page_Trends', propertyName: 'TrendQuestions' },

        'p_Wave': { type: 'QuestionId', locationType: 'Survey', propertyName: 'WaveQuestion', isInReverseOrder: true}

    };

    // mandatory parameters can be single or multi. Must have default value when a page opens
    static var mandatoryPageParameters = ['p_projectSelector', 'p_TimeUnitWithDefault', 'p_TimePeriod', 'p_OpenTextQs', 'p_CustomOpenTextQs', 'p_AllOpenTextQs', 'p_TrendQs', 'p_Demographics', 'p_BenchmarkSet', 'p_Wave', 'p_QsToFilterBy', 'p_Dimensions'];

    // optional parameters are usually multiple. Can be empty by default
    static var optionalPageParameters = ['p_ScoreQs', 'p_TagQs', 'p_TimeUnitNoDefault', 'p_CatDD_TimeUnitNoDefault']; // we must add them empty option as 1st value instead

    static public var cachedParameterOptions = {};

    static const paramTypesToBeReset = {
        'PulseSurveyInfo': false,
        'QuestionId': false,
        'StaticArrayofObjects': false,
        'CustomQuestionList': true,
        'ParameterOptionList': true,
        'QuestionList': true,
        'QuestionAndCategoriesList': true
    };

    /*
  * Populates p_SurveyType parameter based on surveys from Config.
  * @param {object} context - contains Reportal scripting state, log, report, user, parameter objects
  */

    static function LoadParameter_SurveysSelector_ConfigList(context) {

        var parameter = context.parameter;
        var log = context.log;
        var surveys = Config.Surveys;

        for (var i=0; i<surveys.length; i++) {

            if(!surveys[i].isHidden && User.isUserValidForSurveybyRole(context, surveys[i].AvailableForRoles, 'load param')) {
                var val : ParameterValueProject = new ParameterValueProject();
                val.ProjectSource = new ProjectSource(ProjectSourceType.DataSourceNodeId, surveys[i].Source);
                parameter.Items.Add(val);
            }
        }

        return;
    }

    /*
  * Populates p_projectSelector based on pid and pname questions.
  * @param {object} context - contains Reportal scripting state, log, report, parameter objects
  */

    static function  MaskParameter (context) {

        var parameterId = context.parameterId;
        var mask = context.mask;
        var log = context.log;
        var state = context.state;
        var report = context.report;

        if (parameterId === 'p_Statements') {
            mask.Access = ParameterAccessType.Inclusive;

            var dimension = ParamUtil.GetSelectedCodes(context, 'p_Dimensions')[0];
            var qIds = report.TableUtils.GetRowHeaderCategoryIds("QuestionsByDimension");
            for (var i=0; i<qIds.length; i++) {
                mask.Keys.Add(qIds[i]);
            }

        }

    }

    /*
  * Check if parameter needed to be loaded with values, i.e. relevant for the survey
  * @param {object} context - contains Reportal scripting state, log, report, parameter objects
  * @return {Boolean}
  */
    static function isParameterToBeLoaded (context) {

        var parameter = context.parameter;
        var parameterName = parameter.ParameterId;
        var log = context.log;

        if(parameterName === 'p_projectSelector') {
            return !DataSourceUtil.isProjectSelectorNotNeeded (context);
        }

        if(parameterName === 'p_Results_CountsPercents') {
            var user = context.user;

            if (user.UserType != ReportUserType.Enduser) {
                return true;
            }

            var isDetailedView = false;
            var detailedViewRoles = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'DetailedViewRoles');

            if (!detailedViewRoles || detailedViewRoles.length <= 0) {
                return true;
            }

            for (var i = 0; i < detailedViewRoles.length; i++) {
                if (user.HasRole(detailedViewRoles[i])) {
                    isDetailedView = true;
                    break;
                }
            }

            return isDetailedView;
        }

        // TO DO: pageNames are specified explicitly - this is very bad
        if(parameterName === 'p_Results_TableTabSwitcher') {
            return !DataSourceUtil.isProjectSelectorNotNeeded(context); // only needed for pulse programs
        }

        if(parameterName === 'p_Results_BreakBy') {
            var breakBy = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_Results', 'BreakVariables');
            return (breakBy && breakBy.length > 0) ? true : false;
        }

        if(parameterName === 'p_TimeUnitNoDefault') {
            var breakByTimeUnits = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_Results', 'BreakByTimeUnits');
            return breakByTimeUnits ? true : false;
        }

        if(parameterName === 'p_CategoricalDD_BreakBy') {
            var breakBy = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_CategoricalDrilldown', 'BreakVariables');
            return (breakBy && breakBy.length > 0) ? true : false;
        }

        if(parameterName === 'p_CatDD_TimeUnitNoDefault') {
            var breakByTimeUnits = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_CategoricalDrilldown', 'BreakByTimeUnits');
            return breakByTimeUnits ? true : false;
        }

        if(parameterName === 'p_BenchmarkSet') {
            return DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_Results', 'BenchmarkSet') ? true : false;
        }

        return true;
    }

    /*
  * Reset parametrs according to the list.
  * @param {object} context object {state: state}
  * @param {array} parameterList
  */

    static function ResetParameters (context, parameterList) {

        var state = context.state;
        var i;

        for(i=0; i<parameterList.length; i++) {
            state.Parameters[parameterList[i]] = null;
        }

        return;
    }

    /*
    * Reset parametrs according to the list.
    * @param {object} context object {state: state}
    * @param {array} parameterList
    */

    static function ResetQuestionBasedParameters (context, parameterList) {

        var state = context.state;
        var i;

        for(i=0; i<parameterList.length; i++) {
            var paramType = reportParameterValuesMap[parameterList[i]].type;
            var isTypeToReset = paramTypesToBeReset[paramType];
            if(isTypeToReset) {
                state.Parameters[parameterList[i]] = null;
            }
        }

        return;
    }


    /*
  * Initialise parametrs on page.
  * Steps to do:
  * - clear all params if new data source is selected
  * - set default values
  * @param {object} context object {state: state, report: report, page: page, log: log}
  */

    static function Initialise (context) {

        var state = context.state;
        var page = context.page;
        var log = context.log;
        var i;

        //log.LogDebug('param init start')

        //set ds if it is not defined
        if (state.Parameters.IsNull('p_SurveyType')) {
            var projectSource = new ProjectSource(ProjectSourceType.DataSourceNodeId, DataSourceUtil.getDefaultDSFromConfig(context));
            state.Parameters['p_SurveyType'] = new ParameterValueProject(projectSource);
        }

        // reset all parameters if a page refreshes when switching surveys
        if (page.SubmitSource === 'surveyType') {
            ResetParameters(context, mandatoryPageParameters.concat(optionalPageParameters));
            Filters.ResetAllFilters(context);
        }

        // Actions page parameters: reset 'p_Statements' if 'p_Dimensions' has been reloaded
        if (page.SubmitSource === 'p_Dimensions') {
            ResetParameters(context, ['p_Statements']);
        }

       // log.LogDebug('project selector processing start')

        // pulse program handler
        if(!DataSourceUtil.isProjectSelectorNotNeeded(context)) {
            
            var selectedPulseSurvey = ParamUtil.GetSelectedCodes(context,'p_projectSelector');
            var showAll = ParamUtil.GetSelectedCodes(context,'p_ShowAllPulseSurveys');

            //set default pulse baby project
            if(selectedPulseSurvey.length===0) {
                state.Parameters['p_projectSelector'] = new ParameterValueResponse(getDefaultParameterValue(context, 'p_projectSelector'));

            } else if(selectedPulseSurvey.length>0 && selectedPulseSurvey[0] !== 'none' && showAll[0]!=='showAll') {
                //user checked "show all pulse surveys" checkbox or changed report base

                var selectedProject = selectedPulseSurvey[0];
                var availableProjects = ParamUtil.GetParameterOptions(context, 'p_projectSelector', 'available proj');
                var doReset = true;

                for(var i=0; i<availableProjects.length; i++) {
                    if(selectedProject === availableProjects[i].Code) {
                        doReset = false;
                        break;
                    }
                }

                if(doReset) {
                    ParamUtil.ResetParameters(context, ['p_projectSelector']);
                }
            }

            //set up object holding questions available on current page
            PulseProgramUtil.setPulseSurveyContentInfo(context);
            PulseProgramUtil.setPulseSurveyContentBaseValues(context);
    
            //reset question and category based params when baby survey changes
            if(page.SubmitSource === 'projectSelector') {
                ResetQuestionBasedParameters(context, mandatoryPageParameters.concat(optionalPageParameters));
                Filters.ResetAllFilters(context);
            }

            
        }
        //log.LogDebug('project selector processing end')
        
        // set default values for mandatory page parameters
        for(i=0; i<mandatoryPageParameters.length; i++) {
            // safety check: set default value if not defined or pulse program changed
            if (!state.Parameters.IsNull(mandatoryPageParameters[i])) {
                continue;
            }

            try {
                var defaultParameterValue = getDefaultParameterValue(context, mandatoryPageParameters[i]);
                if(!defaultParameterValue) {  //parameter is not defined for this DS or on this page
                    continue;
                }
            } catch (e) {continue;}

            // We can't get the type of parameter (single or multi) before its initialisation.
            // So firstly check if it supports ParameterValueMultiSelect options
            try {
                var valArr = [new ParameterValueResponse(defaultParameterValue)];
                var multiResponse : ParameterValueMultiSelect = new ParameterValueMultiSelect(valArr);
                state.Parameters[mandatoryPageParameters[i]] = multiResponse;
            }
                //if not, set it as single select parameter
            catch (e) {
                state.Parameters[mandatoryPageParameters[i]] = new ParameterValueResponse(defaultParameterValue);
            }

        }
        //log.LogDebug('param init end')

    }

    // --------------------------------- WORKING WITH ONE PARAMETER ---------------------------------

    /**
     * Get selected answer codes of the report parameter (single or multi response)
     * @param {Object} context  - object {state: state, log: log}
     * @param {String} parameterName - the name of the report parameter
     * @returns {Array} - list of selected answer codes
     */

    static function GetSelectedCodes (context, parameterName) {
        var state = context.state;
        var log = context.log;

        if (state.Parameters.IsNull(parameterName))
            return [];

        try {
            var param = state.Parameters[parameterName];

            // single select parameter
            if (param instanceof ParameterValueResponse) {
                return [param.StringKeyValue || state.Parameters.GetString(parameterName)];
            }

            // multi-select response
            if (param instanceof ParameterValueMultiSelect) {
                var selectedCodes = [];
                for (var i=0; i<param.Count; i++) {
                    var response : ParameterValueResponse = param[i];
                    selectedCodes.push(response.StringValue || response.StringKeyValue);      //surprisingly, StringKeyValue can be empty for first page load and the key (i.e. Question Id) can extracted via StringValue
                }
                return selectedCodes;

            }

        }
        catch (e) {
            throw new Error ('ParamUtil.GetSelectedCodes: undefined parameter type or value for "'+parameterName+'".')
        }
    }

    /*
  * Get full info about selected answers of the report parameter (single or multi response)
  * @param {Object} context  - object {state: state, log: log}
  * @param {String} parameterName - the name of the report parameter
  * @returns {Array} - list of objects with all parameter properties Code, Label, TimeUnit, etc.
  */

    static function GetSelectedOptions (context, parameterName) {

        var log = context.log;
        var selectedCodes = GetSelectedCodes (context, parameterName);
        var parameterOptions = GetParameterOptions( context, parameterName, 'get selected options');
        var selectedOptions = [];

        for (var i=0; i<selectedCodes.length; i++) {
            for (var j=0; j<parameterOptions.length; j++) {
                if (selectedCodes[i] === parameterOptions[j].Code) {
                    selectedOptions.push(parameterOptions[j]);
                    break;
                }
            }
        }

        return selectedOptions;
    }

    /*
  * Get defaultParameterValue for parameter
  * @param {object} context - contains Reportal scripting state, log, report, parameter objects
  * @param {string} parameterName
  * @returns {string} default value
  */

    static function getDefaultParameterValue(context, parameterName) {

        var log = context.log;
        var parameterOptions = GetParameterOptions(context, parameterName, 'get default'); // get all options

        return parameterOptions.length>0 ? parameterOptions[0].Code : ''; // return the 1st option
    }

    /*
  * Adding values to single response parameter
  * @param {object} context - contains Reportal scripting state, log, report, parameter objects
  */
    static function LoadParameter (context) {

        var parameter = context.parameter;
        var log = context.log;

        var currentPage = context.pageContext.Items['CurrentPageId'];

        if(!isParameterToBeLoaded (context)) { // no need to load parameter
            return;
        }

        var parameterOptions = GetParameterOptions(context, null, 'load'); // get options

        for(var i=0; i<parameterOptions.length; i++) { // populate parameter
            var val = new ParameterValueResponse();
            val.StringKeyValue = parameterOptions[i].Code;
            val.StringValue = parameterOptions[i].Label;
            parameter.Items.Add(val);
        }

        return;
    }

    //-----------------------------------------------------------------------------


    /**
     * cache parameter values
     */
    static function CacheParameterOptions(context, parameterId) {

        var log = context.log;
        var pageContext = context.pageContext;
        var key = pageContext.Items['userEmail']+'_'+DataSourceUtil.getDsId(context)+'_'+parameterId;
        
        if(cachedParameterOptions.hasOwnProperty(key)) {
            return;
        }

        var parameterInfo = GetParameterInfoObject(context, parameterId); //where to take parameter values from
        var resource = getParameterValuesResourceByLocation(context, parameterInfo);
        var paramOptionsObj = {};

        paramOptionsObj['type'] = parameterInfo.type;
        paramOptionsObj['options'] = !resource ? [] : modifyOptionsOrder(context, getRawOptions(context, resource, parameterInfo.type), parameterInfo);
        cachedParameterOptions[key] = paramOptionsObj;

        return;
    }

    /**
     * get copy of parameter options from cache in
     */
    static function GetParameterOptionsFromCache(context, parameterId) {
        //cached options might need to be modified (exclude no data options)
        //copy needed to avoid 'spoiling' full list with exclude

        var log = context.log;
        var pageContext = context.pageContext;
        var key = pageContext.Items['userEmail']+'_'+DataSourceUtil.getDsId(context)+'_'+parameterId;
        var options = [];

        for(var i=0; i<cachedParameterOptions[key]['options'].length; i++) {
            options.push(cachedParameterOptions[key]['options'][i]);
        }

        return options;
    }


    /**
     * This function returns parameter options in standardised format.
     * @param: {object} - context {state: state, report: report, parameter: parameter, log: log}
     * @param: {string} - parameterName optional, contains parameterId to get parameter's default value
     * @returns: {array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function GetParameterOptions (context, parameterName, from) {

        var log = context.log;
        var pageContext = context.pageContext;
        var parameterId = parameterName || context.parameter.ParameterId; //context.hasOwnProperty('parameter') ? context.parameter.ParameterId : parameterName;
        var paramType;
        var options = [];
        var key = pageContext.Items['userEmail']+'_'+DataSourceUtil.getDsId(context)+'_'+parameterId;

        //log.LogDebug(' ---- START '+parameterId+ ' from '+((String)(from)).toUpperCase()+' ---- ')

        //CacheParameterOptions(context, parameterId);

        //paramType = cachedParameterOptions[key]['type'];
        //options = GetParameterOptionsFromCache(context, parameterId);

        //--------------------------------------------------
        var parameterInfo = GetParameterInfoObject(context, parameterId); //where to take parameter values from
        var resource = getParameterValuesResourceByLocation(context, parameterInfo);

        if(!resource) {
            return [];
        }

        paramType = parameterInfo.type;
        options = getRawOptions(context, resource, paramType);
        options = modifyOptionsOrder(context, options, parameterInfo);
        //--------------------------------------------------

        var paramToBeFiltered = paramType === 'QuestionList' || paramType === 'QuestionAndCategoriesList' || paramType === 'CustomQuestionList';

        if(!DataSourceUtil.isProjectSelectorNotNeeded(context) && paramToBeFiltered) {
            options = PulseProgramUtil.excludeItemsWithoutData(context, options);
        }
        //log.LogDebug(' ---- END    '+parameterId+ ' from '+((String)(from)).toUpperCase()+' ---- ')

        return options;
    }

    /**
     * parameterInfo is descriptive object; stores parameter type, options order settings, location settings
     * it is basis for building parameterResource object identifing location of options
     *@param {Object} context
     *@param {String} parameterId
     *@parreturn {Object} parameterInfo - reportParameterValuesMap object
     */
    static function GetParameterInfoObject(context, parameterId) {

        var parameterInfo = {};

        if(parameterId.indexOf('p_ScriptedFilterPanelParameter')===0) {
            parameterInfo = generateResourceObjectForFilterPanelParameter(context, parameterId);
        } else {
            parameterInfo = reportParameterValuesMap[parameterId];
        }

        if(!parameterInfo) {
            throw new Error('ParamUtil.GetParameterOptions: either parameterId or parameter resource for this parameter is undefined.');
        }

        return parameterInfo;
    }

    /**
     *@param {Object} context
     *@param {Array} array of options [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     *@param {Object} parameterInfo - reportParameterValuesMap object
     *@return {Array} [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function modifyOptionsOrder(context, options, parameterInfo) {

        if(parameterInfo.isInReverseOrder) {

            var reversed = [];
            for(var i=options.length-1; i>=0; i--) {
                reversed.push(options[i]);
            }

            return reversed;
        }

        return options;
    }


    /**
     *@param {Object} context
     *@param {Object| String| Array|...} resource - depends on type of resurce
     *@param {String} type: see reportParameterValuesMap object, property type
     *@return {Array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function getRawOptions(context, resource, type) {
        // propertyValue is a questionId; question answer list are options
        if(type === 'QuestionId') {
            return getOptions_QuestionAnswersSelector(context, resource);
        }

        // propertyValue is a static array with predefined options
        if(type === 'StaticArrayofObjects') {
            return getOptions_StaticArrayOfObjectsSelector (context, resource);
        }

        // propertyValue is a list of question ids, i.e. populate question selector
        if(type === 'QuestionList') {
            return getOptions_QuestionList (context, resource);
        }

        if(type === 'CombinationOfQuestions') {
            return getOptions_CombinationOfQuestionsSelector(context, resource);
        }

        if (type === 'QuestionAndCategoriesList') {
            return getOptions_QuestionAndCategoriesList(context, resource);
        }

        if(type === 'PulseSurveyInfo') {
            return getOptions_PulseSurveyInfo(context, resource['storageInfo']);
        }

        if(type === 'CustomQuestionList') {
            return getOptions_CustomQuestionList (context, resource);
        }

        if(type === 'ParameterOptionList') {
            return getOptions_ParameterList (context, resource);
        }

        throw new Error('ParamUtil.GetParameterOptions: parameter options cannot be defined.');
    }

    /**
     * Get clean resource for parameter from its location
     * @param {object} context
     * @param {object} parameterInfo with locationType and other data to retrieve the resource
     * @return {object} - depends on parameter
     */

    static function getParameterValuesResourceByLocation(context, parameterInfo) {

        // fetch propertyValue and then transform into needed format
        // locationType will tell where to fetch value from

        if(parameterInfo.locationType === 'TextAndParameterLibrary') {
            return TextAndParameterLibrary.ParameterValuesLibrary[parameterInfo.propertyName]; // return value as is
        }

        if(parameterInfo.locationType === 'Page') {
            return DataSourceUtil.getPagePropertyValueFromConfig(context, parameterInfo.page, parameterInfo.propertyName); // static array, qid array, qid
        }

        if(parameterInfo.locationType === 'Survey') {
            return DataSourceUtil.getSurveyPropertyValueFromConfig(context, parameterInfo.propertyName); // static array, qid array, qid
        }

        if(parameterInfo.locationType === 'CombinationOfQuestions') {
            return {Codes: parameterInfo.qIdCodes, Labels: parameterInfo.qIdLabels }
        }

        if(parameterInfo.locationType === 'FilterPanel') {
            return parameterInfo.FilterQid;
        }

        if(parameterInfo.locationType === 'QuestionCategory') {
            var customCategory = DataSourceUtil.getPagePropertyValueFromConfig(context, parameterInfo.page, parameterInfo.propertyName);
            var custom_questions = QuestionUtil.getQuestionsByCategory (context, customCategory);
            var custom_qIds = [];
            for (var i=0; i<custom_questions.length; i++) {
                var custom_question : Question = custom_questions[i];
                custom_qIds.push(custom_question.QuestionId);
            }
            return custom_qIds;
        }

        if(parameterInfo.locationType === 'CombinationOfParameters') {
            var paramNames = parameterInfo.parameterList;
            return paramNames;
        }

        throw new Error('ParamUtil.getParameterValuesResource: Cannot define parameter value resource by given location.');
    }

    /** 
    *Populates p_projectSelector based on storageInfo settings from Congfig.
    *@param {object} context - contains Reportal scripting state, log, report, parameter objects
    *@param {object} storageInfo 
    *@return {Array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
    */
    static function getOptions_PulseSurveyInfo(context, storageInfo) {
        return PulseSurveysInfoFabric.getPulseSurveysInfo(context, storageInfo).getVisiblePulseSurveys(context);
    }

    /*
  *Populates p_projectSelector based on pid and pname questions.
  *@param {object} context - contains Reportal scripting state, log, report, parameter objects
  *@return {Array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
  */

    static function getOptions_CombinationOfQuestionsSelector(context, locationObj) {

        var log = context.log;
        var codes : Answer[] = QuestionUtil.getQuestionAnswers(context, locationObj['Codes']);
        var labels : Answer[] = QuestionUtil.getQuestionAnswers(context, locationObj['Labels']);
        var options = [];

        for(var i=0; i<codes.length; i++) {
            var option = {};
            option.Label = codes[i].Precode;
            option.Code = labels[i].Precode;
            options.push(option);
        }


        return options;
    }


    /**
     *@param {object} context
     *@param {string} qid
     *@return {Array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function getOptions_QuestionAnswersSelector(context, qid) {

        var parameterOptions = [];
        var answers: Answer[] = QuestionUtil.getQuestionAnswers(context, qid);

        for(var i=0; i<answers.length; i++) {
            var option = {};
            option.Label = answers[i].Text;
            option.Code = answers[i].Precode;
            parameterOptions.push(option);
        }

        return parameterOptions;
    }

    /**
     *@param {object} context
     *@param {array} arary of objevts {Code:, Label:}
     *@return {Array} - [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function getOptions_StaticArrayOfObjectsSelector(context, ArrayOfObjects) {

        var parameterOptions = [];
        var report = context.report;

        for(var i=0; i<ArrayOfObjects.length; i++) {

            var option = {};

            for(var prop in ArrayOfObjects[i]) {
                if(prop !== 'Label') {
                    option[prop] = ArrayOfObjects[i][prop];
                } else {
                    option[prop] = ArrayOfObjects[i][prop][report.CurrentLanguage];
                }
            }
            parameterOptions.push(option);
        }
        return parameterOptions;
    }

    /**
     *@param {object} context
     *@param {array} arary of questions
     *@return {array} [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */


    static function getOptions_QuestionList(context, qList) {

        var parameterOptions = [];

        if(!qList instanceof Array) {
            throw new Error('ParamUtil.GetParameterOptions: expected parameter type cannot be used, array of objects was expected.');
        }

        for(var i=0; i<qList.length; i++) {
            var option = {};
            option.Code = qList[i]; // propertyValue[i] is qid in this case
            option.Label = QuestionUtil.getQuestionTitle(context, qList[i]);
            parameterOptions.push(option);
        }

        return parameterOptions;
    }

    /**
     *@param {object} context
     *@param {array} arary of questions
     *@return {array} [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */

    static function getOptions_QuestionAndCategoriesList(context, qIdsAndCatList) {

        var report = context.report;
        var parameterOptions = [];

        if (!qIdsAndCatList instanceof Array) {
            throw new Error('ParamUtil.GetParameterOptions: expected parameter type cannot be used, array of objects was expected.');
        }

        for (var i = 0; i < qIdsAndCatList.length; i++) {
            var option = {};

            if (typeof qIdsAndCatList[i] === 'object' && qIdsAndCatList[i].Type === 'Dimension') { // options is a dimension

                option.Code = qIdsAndCatList[i].Code;
                option.Label = TextAndParameterUtil.getTextTranslationByKey(context, qIdsAndCatList[i].Code);// perfect case: categories are in parameters block not just translations
                option.Type = 'Dimension';
            } else {

                option.Code = qIdsAndCatList[i]; // propertyValue[i] is qid in this case
                option.Label = QuestionUtil.getQuestionTitle(context, qIdsAndCatList[i]);
                option.Type = 'Question';
            }
            parameterOptions.push(option);
        }

        return parameterOptions;
    }


    /**
     *@param {object} context
     *@param {array} array of question Ids
     *@return {array} [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */
    static function getOptions_CustomQuestionList(context, qList) {

        var log = context.log;
        var parameterOptions = [];

        if(!qList instanceof Array) {
            throw new Error('ParamUtil.getOptions_CustomQuestionList: expected parameter type cannot be used, array of objects was expected.');
        }

        var codes = ParamUtil.GetSelectedCodes(context, 'p_projectSelector');

        if (codes.length) {
            var baby_p_number = codes[0];
            for(var i=0; i<qList.length; i++) {
                var customTxt = QuestionUtil.getCustomQuestionTextById(context, qList[i]);
                if (customTxt) {
                    var option = {};
                    option.Code = qList[i]; // propertyValue[i] is qid in this case
                    option.Label = customTxt;
                    parameterOptions.push(option);
                }
            }
        }
        return parameterOptions;
    }

    /**
     *@param {object} context
     *@param {array} array of parameter Ids
     *@return {array} [{Code: code1, Label: label1}, {Code: code2, Label: label2}, ...]
     */
    static function getOptions_ParameterList(context, parameterNameList) {

        var log = context.log;
        var combinedOptions = [];

        for (var i=0; i<parameterNameList.length; i++) {
            combinedOptions = combinedOptions.concat(GetParameterOptions (context, parameterNameList[i], 'param list'));
        }
        return combinedOptions;

    }

    static function generateResourceObjectForFilterPanelParameter(context, parameterId) {

        var resourceInfo = {};
        var filterList = Filters.GetGlobalFilterList(context);
        var paramNumber = parseInt(parameterId.substr('p_ScriptedFilterPanelParameter'.length, parameterId.length));

        resourceInfo.type = 'QuestionId';
        resourceInfo.locationType = 'FilterPanel'

        if(paramNumber <= filterList.length) {
            resourceInfo.FilterQid = filterList[paramNumber-1];
        }

        return resourceInfo;
    }

}
