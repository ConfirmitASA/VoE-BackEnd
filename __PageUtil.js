class PageUtil {

    /*
     * Collection of initialse page scripts.
     * Put here the code that needs to run when page loads.
     * @param {object} context object {state: state, report: report, page: page, user:user, pageContext: pageContext, log: log}
     */

    static function Initialise(context) {

        var state = context.state;
        var page = context.page;
        var log = context.log;
        var pageContext = context.pageContext;

        //log.LogDebug('page init start');
        pageContext.Items.Add('userEmail', context.user.Email);
        pageContext.Items.Add('CurrentPageId', page.CurrentPageId);

        try {
            var add_in_source = DataSourceUtil.getPagePropertyValueFromConfig(context, page.CurrentPageId, 'Source');
            pageContext.Items.Add('Source', add_in_source);
        }
        catch (e) { /* 'Source' is optional page property which allows to use different sources for specific pages. So no need for throwing errors  ' */}

        ParamUtil.Initialise(context); // initialise parameters

        // if in current DS a page shouldn't be visible, than redirect to default page
        // very actual when 1st report page should not be visible
        if(state.ReportExecutionMode === ReportExecutionMode.Web && !isPageVisible(context) ) {
            page.NextPageId = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'DefaultPage');
            return;
        }

        if(!HierarchyUtil.Hide(context) && HierarchyUtil.isDataTableEmpty(context)) { // hierarchy needed and not cached yet
            // populate cached hierarchy if needed
            // for now it's only needed for results page hierarchy benchamrks
            HierarchyUtil.setDataTable(context);
        }

        //for tests
        PulseProgramUtil.printPulseSurveyContentInfoTable(context);
        //log.LogDebug('page init end');
    }

    /*
     * Array of pages that should later be hidden (as there's nothing to show) with js by name.
     * @param {object} context object {state: state, report: report, log: log}
     * @returns {Array} pagesToHide array of page Names that should be hidden
     */

    static function getPageNamesToShow(context) {

        var log = context.log;
        var pagesToShow = [];

        var surveyProperties = DataSourceUtil.getSurveyConfig(context);

        for(var property in surveyProperties) {
            if(property.indexOf('Page_')===0) { //page config
                var isHidden = false;
                isHidden = DataSourceUtil.getPagePropertyValueFromConfig(context, property, 'isHidden');
                if(!isHidden) {
                    pagesToShow.push(TextAndParameterUtil.getTextTranslationByKey(context, property));
                }
            }
        }
        return pagesToShow;
    }

    /*
     * Indicates if page is visible for the selected DS or not.
     * @param {object} context object {state: state, report: report, log: log}
     * @returns {Boolean}
     */

    static function isPageVisible(context) {

        var log = context.log;

        var pageContext = context.pageContext;

        try { // check if CurrentPageId doesn't exist
            var pageId = pageContext.Items['CurrentPageId'];
            return !DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'isHidden');
        } catch (e) {

            return true; // return true by default (i.e. show page)
        }

    }

    //TO DO: temporarily solution. should bу a check for each component, not for a whole page
    /*
     * Check if a page should have a toggle to switch between Chart and Table View
     * @param {object} context object {state: state, report: report, log: log, pageContext: pageContext}
     * @returns {Boolean}
     */

    static function isViewSwitchAvailable (context) {
        var log = context.log;
        var pageContext = context.pageContext;
        if (pageContext.Items['CurrentPageId'] === 'Trend')
            return true;
        return false;
    }

    /*
     * Get property name for page config
     * @param {object} context object {state: state, report: report, log: log, pageContext: pageContext}
     * @returns {string} 'Page_'+pageId
     */
    static function getCurrentPageIdInConfig (context) {

        var log = context.log;

        var pageContext = context.pageContext;
        var pageId;

        if(!!pageContext.Items['CurrentPageId']) {
            pageId = pageContext.Items['CurrentPageId'];
        } else if(context.hasOwnProperty('CurrentPageId') && context.CurrentPageId) {
            pageId = context.CurrentPageId;
        } else {
            throw new Error('PageUtil.getCurrentPageIdInConfig: CurrentPageId is undefined')
        }

        if(pageId.indexOf('_ExcelExport')>0) {
            pageId = pageId.substr(0, pageId.indexOf('_ExcelExport'));
        }

        return 'Page_'+pageId;
    }
}