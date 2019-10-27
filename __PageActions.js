class PageActions {

    /**
     * @memberof PageActions
     * @function Hide
     * @description function to hide the page
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function Hide(context){

        return false;
    }

    /**
     * @memberof PageActions
     * @function Render
     * @description function to render the page
     * @param {Object} context - {component: page, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function Render(context){

    }

    /**
     * @memberof PageActions
     * @function hitlistActions_Hide
     * @description function to hide the hitlist
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function hitlistActions_Hide(context){

        return false;
    }

    /**
     * @memberof PageActions
     * @function hitlistActions_Render
     * @description function to render the hitlist
     * @param {Object} context - {component: hitlist, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function hitlistActions_Render(context){

        var log = context.log;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
        var hitlist = context.hitlist;

        /* retrieve the list of hitlist columns from Config without using 'isCustomSource' (i.e. the main source is used to find Config settings) */
        var staticCols = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'staticColumns');
        var tagCols = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'TagsForHitlist');



        /* add columns to Hiltlist using custom source */
        context.isCustomSource = true;
        for (var i=0; i<staticCols.length; i++) {
            Hitlist.AddColumn(context, staticCols[i], {sortable: true, searchable: true});
        }

        for (var i=0; i<tagCols.length; i++) {
            Hitlist.AddColumn(context, tagCols[i], {sortable: false, searchable: false});
        }

        if(staticCols.length + tagCols.length !== hitlist.Columns.Count) {
            throw new Error('DataSourceUtil.hitlistActions_Render: сheck Config settings for hitlist columns, '+DataSourceUtil.getDsId (context)+'. Duplicated question ids and hierarchy variables are not allowed to use in the hitlist component.');
        }

        Hitlist.AddSurveyLink(context);

    }


    /**
     * @memberof PageActions
     * @function getTagColumnNumbers
     * @description function to get the number of columns with tags.
     * @param {Object} context - {component: hitlist, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @return {Array} - array with numbers of columns
     */
    static function getTagColumnNumbers (context) {

        var log = context.log;
        var state = context.state;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
        var tagColumnNumbers = [];

        var numberOfStaticColumns = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'staticColumns').length;
        var numberOfTagColumns = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'TagsForHitlist').length;

        var numberOfColumnsAtStart = 2 + numberOfStaticColumns; // Hitlist always contains 1 first hidden column with the system field Respondent ID



        for (var i=0; i<numberOfTagColumns; i++) {
            tagColumnNumbers.push(i + numberOfColumnsAtStart);
        }
        return tagColumnNumbers;
    }


    /**
     * @memberof PageActions
     * @function tableKPI_Render
     * @description function to render the Implememted Actions table.
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function getKPIResult(context){

        var log = context.log;
        var report = context.report;
        context.isCustomSource = false;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        var cell : Datapoint = report.TableUtils.GetCellValue("ActionsKPI",1,1);
        if (!cell.IsEmpty && !cell.Value.Equals(Double.NaN)) {

            var color = Config.primaryGreyColor;
            var score = parseFloat((100*cell.Value).toFixed(Config.Decimal));
            var thresholds = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIthreshold');

            for (var j=0; j<thresholds.length; j++) {
                if (score >= thresholds[j].score) {
                    color =  thresholds[j].color;
                    break;
                }
            }
            return [{score: score, color: color, qid: 'actions', format: '%', yAxisMin: 0}];
        }

        return null;
    }




    /**
     * @memberof PageActions
     * @function tableKPI_Render
     * @description function to render the Implememted Actions table.
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function tableKPI_Render(context){

        var log = context.log;
        var report = context.report;
        var state = context.state;
        var table = context.table;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        // % of Implemented actions.
        var formula : HeaderFormula = new HeaderFormula();
        formula.Type = FormulaType.Expression;
        formula.Expression = "IF(CELLV(1, ROWS)!=0 , SUM(COLVALUES(2, ROWS-1))/CELLV(1, ROWS), EMPTYV())";
        formula.Title.Texts.Add(new LanguageText(9, "%"));
        formula.Percent = true;
        table.RowHeaders.Add(formula);


        // the number of Implemented actions.
        var metric  = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPI');
        context.isCustomSource = true;
        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, metric.qId);
        var hq: HeaderQuestion = new HeaderQuestion(qe);
        //hq.FilterByMask = true;
        hq.IsCollapsed = false;
        hq.ShowSubTotals = true;
        hq.ShowTotals = true;
        //hq.HideHeader = true;

        if (metric.codes.length) {
            var qmask : MaskFlat = new MaskFlat(true);
            qmask.Codes.AddRange(metric.codes);
            hq.AnswerMask = qmask;
        }
        hq.Distributions.Enabled = true;
        hq.Distributions.Count = true;
        table.RowHeaders.Add(hq);

    }


    /**
     * @memberof PageActions
     * @function tableQuestionsByDimension_Render
     * @description function to render the QuestionsByDimension table. It's a hidden table used to filter the list of statements by the selected dimension
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */

    static function tableQuestionsByDimension_Render(context){

        var log = context.log;
        var table = context.table;

        var dimension = ParamUtil.GetSelectedCodes(context, 'p_Dimensions')[0];
        var categorization : HeaderCategorization = new HeaderCategorization();
        categorization.CategorizationId = dimension;
        categorization.DataSourceNodeId = DataSourceUtil.getDsId(context);
        categorization.DefaultStatistic = StatisticsType.Average;
        categorization.CalculationRule = CategorizationType.AverageOfAggregates; // AvgOfIndividual affects performance
        categorization.Preaggregation = PreaggregationType.Average;
        categorization.SampleRule = SampleEvaluationRule.Max;
        categorization.Collapsed = false;
        categorization.Totals = false;
        table.RowHeaders.Add(categorization);

    }



    /**
     * @memberof PageActions
     * @function addActionTrendSeriesByParam
     * @description function to add action trend series
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */

    static function setActionTrendSeriesByParam(context, seriesParam) {

        var state = context.state;
        var table = context.table;
        var log = context.log;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        var index = seriesParam.order;

        var trendSeries  = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'Trend');

        if (trendSeries.length > index) {

            // add row with action status
            context.isCustomSource = true;
            var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, trendSeries[index].qId);
            var hq: HeaderQuestion = new HeaderQuestion(qe);
            hq.IsCollapsed = false;
            hq.FilterByMask = true;
            hq.ShowTotals = false;
            hq.Distributions.Enabled = true;
            hq.Distributions.Count= true;
            hq.HideHeader = true;
            if (trendSeries[index].code) {
                var qmask : MaskFlat = new MaskFlat(true);
                qmask.Codes.Add(trendSeries[index].code);
                hq.AnswerMask = qmask;
            }
            table.RowHeaders.Add(hq);

            // add column - trending by Date variable
            TableUtil.addTrending(context, trendSeries[index].date);

            var hd : HeaderQuestion = table.ColumnHeaders[0];
            var toDate : DateTime = DateTime.Now;
            hd.TimeSeries.StartDate = new DateTime (2019, 1, 1);
            hd.TimeSeries.EndDate = toDate;
        }

    }


    /**
     * @memberof PageActions
     * @function tableTrend_Render
     * @description function to render the trend table
     * @param {Object} context - {component: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function tableTrend_Render(context){

        var report = context.report;
        var state = context.state;
        var table = context.table;
        var log = context.log;

        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
        var trendSeries  = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'Trend');

        // add 1st series
        setActionTrendSeriesByParam(context, {order: 0});

        // copy the 2nd series from the hidden table
        if (trendSeries.length > 1) {
            var hc : HeaderContent = new HeaderContent();
            var dpArray : Datapoint[] = report.TableUtils.GetRowValues("ActionsTrend_Hidden1",1);
            for (var i=0; i<dpArray.Length; i++) {
                var notStartValue = dpArray[i].Value;
                if (!notStartValue.Equals(Double.NaN)) {
                    hc.SetCellValue(i, notStartValue);
                }
            }
            var project : Project = DataSourceUtil.getProject(context);
            var question : Question = project.GetQuestion(trendSeries[1].qId);
            var series_name = question.GetAnswer(trendSeries[1].code).Text;

            hc.Title = new Label(report.CurrentLanguage, series_name);
            table.RowHeaders.Add(hc);
        }

        // global table settings
        table.Decimals = 0;
        table.RemoveEmptyHeaders.Columns = true;
        table.Caching.Enabled = false;

    }


    /**
     * @memberof PageActions
     * @function tableTrend_Render
     * @description function to render the trend table
     * @param {Object} context - {component: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function tableTrendHidden_Render(context) {

        var report = context.report;
        var state = context.state;
        var table = context.table;
        var log = context.log;

        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        setActionTrendSeriesByParam(context, {order: 1});

        // global table settings
        table.RemoveEmptyHeaders.Columns = false;
        table.Caching.Enabled = false;

    }


    /**
     * @memberof PageActions
     * @function tableTrend_Render
     * @description function to render the trend table
     * @param {Object} context - {component: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function tableBreakdown_Render (context) {

        var report = context.report;
        var state = context.state;
        var table = context.table;
        var log = context.log;

        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        var qId  = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'Breakdown');
        context.isCustomSource = true;
        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, qId);
        var hq : HeaderQuestion = new HeaderQuestion(qe);
        hq.Distributions.Enabled = true;
        hq.Distributions.HorizontalPercents = true;
        hq.ShowTotals = false;
        table.ColumnHeaders.Add(hq);

        // global table settings
        table.RemoveEmptyHeaders.Columns = false;
        table.Caching.Enabled = false;
    }


    static function getActionLink(context){

        var log = context.log;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        return DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'SurveyLink');
    }


    static function ActionBtn_Render (context) {

        var report = context.report;
        var state = context.state;
        var user = context.user;
        var text = context.text;
        var log = context.log;

        // End user
        var userid = user.UserId;

        // Hierarchy
        var hier = !HierarchyUtil.Hide(context) ? user.PersonalizedReportBase : null;


        // Project
        var project : Project = DataSourceUtil.getProject(context);
        var pid = project.ConfirmitProjectId;
        var pname = project.ProjectName;

        // Wave
        var wave = null;
        if(!Filters.isWaveFilterHidden(context)) {
            var qId = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'WaveQuestion');
            var selectedCodes = ParamUtil.GetSelectedCodes(context, 'p_Wave');
            if (selectedCodes.length) {
                wave = selectedCodes[0];
            }
        }

        // Dimension
        var dimension = ParamUtil.GetSelectedOptions(context, 'p_Dimensions').length ? ParamUtil.GetSelectedOptions(context, 'p_Dimensions')[0].Label : null;

        // Statement
        var questionId = ParamUtil.GetSelectedCodes (context, 'p_Statements').length ? ParamUtil.GetSelectedCodes (context, 'p_Statements')[0] : null;

        // Statement text
        var questionText = ParamUtil.GetSelectedOptions(context, 'p_Statements').length ? ParamUtil.GetSelectedOptions(context, 'p_Statements')[0].Label : null;

        // Link
        var actionLink = PageActions.getActionLink(context);

        var link = '<a href="'+ actionLink + '?U=' + userid + '&hier=' + hier + '&pid=' + pid + '&pname=' + pname +
            '&wave=' + wave +'&dimension=' + dimension + '&questionId=' + questionId +'&questionText=' + questionText +
            '" class="icon icon--add" target="_blank" title="'+TextAndParameterUtil.getTextTranslationByKey(context, 'ActionAddBtn')+'"></a>';
        text.Output.Append(link);

    }

}