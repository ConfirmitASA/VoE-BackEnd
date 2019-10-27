class ListControlUtil {

    /*
     * Hide list if parameter is not needed.
     * @param {object} context object {state: state, report: report, pageContext: pageContext, log: log}
     * @param {string} parameterName
     * @return {boolean}
     */

    static function hideListControl(context, parameterName) {

        var log = context.log;
        var pageContext = context.pageContext;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);



        if(parameterName === 'p_Results_TableTabSwitcher') {

            return DataSourceUtil.isProjectSelectorNotNeeded(context); // only needed for pulse programs
        }

        var kpiQids = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPI');

        if(parameterName === 'p_QsToFilterBy' && kpiQids.length == 1) {

            return true;
        }

    }
}