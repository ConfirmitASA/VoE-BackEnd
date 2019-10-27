class FilterSummary {

    /**
     * Get string "parameter label: parameter value" instead of drop downs for PDF export.
     * @param {object} context object {state: state, report: report, log: log}
     * @param {paramName} parameter name
     * @param {filterText} key word for parameter label
     */

    static function filterSummaryText_Render (context, paramName, filterText) {

        var text = context.text;
        var log = context.log;
        var filterName = TextAndParameterUtil.getTextTranslationByKey(context, filterText);
        var filterValues = ParamUtil.GetSelectedOptions(context, paramName);

        if(filterValues.length>0) { // do not print anything if parameter is empty

            var filterLabels = [];
            for(var i=0; i<filterValues.length; i++) {
                filterLabels.push(filterValues[i].Label);
            }
            text.Output.Append(filterName+" "+filterLabels.join(', ')+"<br>"+System.Environment.NewLine);
        }
    }

    /**
     * indicates if filter summary for a card should be hidden or not
     * @param {object} context
     * @returns {Boolean} - if hide card's filter summary or not
     */
    static function filterSummaryText_Hide(context) {
        return !Export.isExportMode(context);
    }

    /*
    * Get string "parameter label: parameter value" instead of drop downs for PDF export.
    * @param {object} context object {state: state, report: report, log: log, user: user, pageContext: pageContext}
    * @return {paramName} str to append to text component
    */
    static function globalReportFilterSummaryText_Render (context) {

        var log = context.log;
        var state = context.state;
        var user = context.user;
        var pageContext = context.pageContext;
        var str = '';

        // data source
        str += Export.displayDataSourceInfo(context);

        //hierarchy
        str += '<div>'+TextAndParameterUtil.getTextTranslationByKey(context, 'ReportBase')+' '+user.PersonalizedReportBaseText+'</div>';
        str += System.Environment.NewLine;

        //selected date period
        if(DataSourceUtil.isProjectSelectorNotNeeded(context) && !DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'WaveQuestion')) { // no date filter in pulse programs
            var datePeriod = DateUtil.defineDateRangeBasedOnFilters(context);
            var start: DateTime = datePeriod.startDate;
            var end: DateTime = datePeriod.endDate;

            str += '<div>'+TextAndParameterUtil.getTextTranslationByKey(context, 'TimePeriod')+' '+start.ToShortDateString()+' - '+end.ToShortDateString()+'</div>';
            str += System.Environment.NewLine;
        }

        //selected wave
        if(DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'WaveQuestion')) {

            str += '<div>'+TextAndParameterUtil.getTextTranslationByKey(context, 'Waves')+' '+ParamUtil.GetSelectedOptions(context, 'p_Wave')[0].Label+'</div>';
            str += System.Environment.NewLine;
        }

        //filter panel filters
        var filterOptions = Filters.GetFiltersValues(context, 'global');

        for(var i=0; i<filterOptions.length; i++) {

            var options = [];
            for(var j=0; j<filterOptions[i].selectedOptions.length; j++) {
                var option = filterOptions[i].selectedOptions[j];
                options.push(option.Label);
            }
            str += '<div>'+filterOptions[i].Label+': '+options.join(', ')+'</div>';
            str += System.Environment.NewLine;
        }

        return '<div class="material-card material-card_global-filter-summary">'+str+'</div>'

    }

    /**
     * indicates if filter summary for a card should be hidden or not
     * @param {object} context
     * @returns {Boolean} - if hide card's filter summary or not
     */
    static function globalReportFilterSummaryText_Hide(context) {

        var log = context.log;
        var state = context.state;
        var pageContext = context.pageContext;
        var isDefaultPage = pageContext.Items['CurrentPageId'] === DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'DefaultPage');
        var str = '';

        return !((Export.isPdfExportMode(context) && isDefaultPage) || Export.isExcelExportMode (context));
    }

}
