class PageCategoricalDrilldown {

    /**
     * @memberof PageCategoricalDrilldown
     * @function displayCategoryTitleByDrilldown
     * @description function to display categorical question title/text
     * @param {Object} context - {table: table, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function displayCategoryTitleByDrilldown (context) {

        var report = context.report;
        var state = context.state;
        var log = context.log;
        var text = context.text;

        var drillDownQId = state.Parameters.GetString('p_Drilldown');
        text.Output.Append(QuestionUtil.getQuestionTitle (context, drillDownQId));

    }


    /**
     * @memberof PageCategoricalDrilldown
     * @function tableDrilldown_Hide
     * @description function to hide the table.
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function tableDrilldown_Hide(context) {

        return SuppressUtil.isGloballyHidden(context);

    }


    /**
     * @memberof PageCategoricalDrilldown
     * @function tableDrilldown_Render
     * @description function to build Categorical Drilldown table
     * @param {Object} context - {table: table, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */

    static function tableDrilldown_Render(context){

        var state = context.state;
        var log = context.log;
        var table = context.table;
        var suppressSettings = context.suppressSettings;
        var project : Project = DataSourceUtil.getProject(context);

        // add row  = header question
        var drillDownQId = state.Parameters.GetString('p_Drilldown');
        var qe : QuestionnaireElement =  QuestionUtil.getQuestionnaireElement(context, drillDownQId);
        var qInfo = QuestionUtil.getQuestionInfo(context, drillDownQId);
        var question : Question = project.GetQuestion(qInfo.questionId);
        var row : HeaderQuestion = new HeaderQuestion(qe);

        TableUtil.maskOutNA(context, row);
        row.IsCollapsed = (question.QuestionType === QuestionType.Single) ? false : true;
        row.ShowTitle = false;
        row.ShowTotals = false;
        TableUtil.addBreakByNestedHeader(context, row);
        table.RowHeaders.Add(row);

        // add columns = bar chart, Count and VP
        var barChart: HeaderChartCombo = new HeaderChartCombo();
        var chartValue: ChartComboValue = new ChartComboValue();
        chartValue.Expression = 'cellv(col+1, row)';
        chartValue.BaseColor = new ChartComboColorSet([Config.barChartColors_Distribution[0].color]);
        barChart.Values = [chartValue];
        barChart.TypeOfChart = ChartComboType.Bar100;
        table.ColumnHeaders.Add(barChart);

        var hb : HeaderBase = new HeaderBase();
        hb.Distributions.Enabled = true;
        hb.Distributions.Count = true;
        hb.Distributions.VerticalPercents = true;
        hb.Distributions.UseInnermostTotals = true;
        hb.HideHeader = true;

        var hc : HeaderSegment = new HeaderSegment(TextAndParameterUtil.getLabelByKey(context, 'Responses'), '');
        hc.DataSourceNodeId = DataSourceUtil.getDsId (context);
        hc.SubHeaders.Add(hb);
        table.ColumnHeaders.Add(hc);

        // global table settings
        table.RemoveEmptyHeaders.Rows = false;
        table.Sorting.Rows.SortByType = TableSortByType.Position;
        table.Sorting.Rows.Position=2;
        table.Sorting.Rows.Direction = TableSortDirection.Descending;
        table.Sorting.Rows.Enabled = true;
        SuppressUtil.setTableSuppress(table, suppressSettings);

    }
}
