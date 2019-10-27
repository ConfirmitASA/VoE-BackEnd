/* DATA SUPPRESSION INFO:

1. For basic suppress settings use Config. If you don't need some type of data suppression, set the min limit to 0.

2. Report Base and Hierarchy rules are applied to all Reportal components via components' Hide scripts. If the rules are not met, the whole component is hidden).
Exception: KPI gauge on page Key KPI. The gauge is rendered by JS, so the checking process is performed in the PageKPI.getKPIResult method

3. If you need to change suppress behaviour for Agg.tables (e.g. show/hide individual table cells, suppression in the columns/rows), use Render script to update
the SuppressSettings object  (var suppressSettings = {type: 'row', displayBaseOption: 'hide', displayCellOption: 'hide'})

4. For Verbatim table, use either the verbatim_Hide function or the script in the verbatim_Render method (class PageKPI). The former uses the general base of the verbatim question.
The latter measures bases for positive and negative verbatims separately.

5. The Hitlist component is controlled by hitlistComments_Hide.
It is hidden if there are not enough answers to an open text question in general and/or for cross-tabs of tag questions and open text.

6. Data Suppression is not applied to the Response Rate page.

*/


class SuppressUtil {
    
    
        /*================================================================================
       * Set up suppress base
       * @param {Table} table - aggregated table
       * @param {Object} suppressSettings
       * @property {String} type - allowed values are ‘row’ or ‘column’ (i.e. it controls where the question for which you want to hide the results is placed: in the rows or columns).
       * @property {String} displayBaseOption  - defines how cells containing base values less than the minimum are displayed (parameter value ‘hide’ means that cells should be hidden if the minimum limit is not met;  if the parameter = ‘show’, the cell value is displayed anyway).
       * @property {String} displayCellOption  - allows individual table cells to be suppressed regardless of base (parameter value ‘hide’ means that cells should be hidden if the minimum limit is not met;  if the parameter = ‘show’, the cell value is displayed anyway).
       * @property {int} minBase - the suppress base limit. Optional parameter, the default value is set up in Config
       */
    
        static function setTableSuppress(table, suppressSettings) {
            var type = suppressSettings.type;
            var displayBaseOption = suppressSettings.displayBaseOption;
            var displayCellOption = suppressSettings.displayCellOption;
            var suppressValue = suppressSettings.minBase || SuppressConfig.TableSuppressValue;
            var cellValue = suppressSettings.cellLimit || suppressValue;
    
            table.SuppressData.SuppressData = true;
            table.SuppressData.BaseLessThan = suppressValue;
    
            if (type=="row") table.SuppressData.DistributionMeasure = DistributionMeasureType.InnermostRow;
            else table.SuppressData.DistributionMeasure = DistributionMeasureType.InnermostColumn;
            table.SuppressData.CellStatistic = CellStatisticType.Count;
    
            if (displayBaseOption == 'hide') table.SuppressData.BaseDisplay = BaseDisplayOption.Hide;
            else if (displayBaseOption == 'showMarker') table.SuppressData.BaseDisplay = BaseDisplayOption.ShowMarker;
            else table.SuppressData.BaseDisplay = BaseDisplayOption.Show;
    
            if (displayCellOption == 'hide') { table.SuppressData.CellDisplay = BaseDisplayOption.Hide; table.SuppressData.CellLimit = cellValue; }
            else if (displayCellOption == 'showMarker') { table.SuppressData.CellDisplay = BaseDisplayOption.ShowMarker; table.SuppressData.CellLimit = cellValue; }
            else table.SuppressData.CellDisplay = BaseDisplayOption.Show;
        }
    
    
        static function buildHierarchyTable(context) {
    
            var report = context.report;
            var state = context.state;
            var table = context.table;
            var log = context.log;
    
            var hb : HeaderBase = new HeaderBase();
            hb.Distributions.Enabled = true;
            hb.Distributions.Count = true;
            table.ColumnHeaders.Add(hb);
    
            var hierachyId = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'HierarchyQuestion');
            if (hierachyId) {
                var qe : QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, hierachyId);
                var row : HeaderQuestion = new HeaderQuestion(qe);
                row.HierLayout = HierLayout.Nested;
                row.ReferenceGroup.Enabled = true;
                row.ReferenceGroup.Self = true;
                row.ShowTotals = false;
                table.RowHeaders.Add(row);
    
                var row2 : HeaderQuestion = new HeaderQuestion(qe);
                row2.HierLayout = HierLayout.Flat;
                row2.ReferenceGroup.Enabled = true;
                row2.ReferenceGroup.Self = false;
                row2.ReferenceGroup.Parent = true;
                row2.ShowTotals = false;
                table.RowHeaders.Add(row2);
    
                var row3 : HeaderQuestion = new HeaderQuestion(qe);
                row3.HierLayout = HierLayout.Nested;
                row3.ReferenceGroup.Enabled = true;
                row3.ReferenceGroup.Self = true;
                row3.ReferenceGroup.AllSiblings = true;
                row3.ShowTotals = false;
                table.RowHeaders.Add(row3);
    
            }
    
        }
    
        static function buildHierarchyTableForResults(context) {
    
            var report = context.report;
            var state = context.state;
            var table = context.table;
            var log = context.log;
    
            var hb : HeaderBase = new HeaderBase();
            hb.Distributions.Enabled = true;
            hb.Distributions.Count = true;
            table.ColumnHeaders.Add(hb);
    
            var hierachyId = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'HierarchyQuestion');
            if (hierachyId) {
                var qe : QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, hierachyId);
                var row : HeaderQuestion = new HeaderQuestion(qe);
                row.ReferenceGroup.Enabled = true;
                row.ReferenceGroup.Self = true;
                row.ReferenceGroup.NumberOfChildLevels = 1;
                row.ShowTotals = false;
                table.RowHeaders.Add(row);
    
            }
    
        }
    
    
    
        static function buildReportBaseTable(context) {
    
            var report = context.report;
            var state = context.state;
            var table = context.table;
            var log = context.log;
    
            var response  = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'Response');
            var qe : QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, response.qId);
            var hq: HeaderQuestion = new HeaderQuestion(qe);
            hq.IsCollapsed = true;
            hq.FilterByMask = true;
            hq.ShowTotals = false;
            hq.Distributions.Enabled = true;
            hq.Distributions.Count = true;
    
            if (response.codes.length) {
                var qmask : MaskFlat = new MaskFlat(true);
                qmask.Codes.AddRange(response.codes);
                hq.AnswerMask = qmask;
            }
    
            table.RowHeaders.Add(hq);
        }
    
    
        // Hide small units: a node should not show if it has less than X
        static function reportBaseIsLow (context) {
    
            var report = context.report;
            var log = context.log;
            
            
            var N_of_participants = report.TableUtils.GetCellValue('Confidentiality:ReportBase',1, 1).Value;
    
            if (N_of_participants.Equals(Double.NaN) || (N_of_participants < SuppressConfig.ReportBaseSuppressValue)) {
                return true;
            }
            return false;
    
        }
    
        static function hierarchyUnitIsSensitive (context) {
    
            var report = context.report;
            var log = context.log;
            var state = context.state;
            var pageContext = context.pageContext;
            var user = context.user;          

            // if no hierarchy question is defined in Config, we don't perform checking
            if (!DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'HierarchyQuestion'))
                return false;

            // if multiple hierachy selection is allowed, no confidentionality checks are performed, i.e.
            // all  nodes are shown irrespective of small neighbor units
            var user_bases = user.PersonalizedReportBase.split(',');
            if (user_bases.length > 1) 
               return false;
    
    
            var bases : Datapoint[] = report.TableUtils.GetColumnValues("Confidentiality:HierarchyTable",1);
            var selfUnitBase = bases[0].Value;
    
    
            // 1. If a node has <unitSufficientBase> answers or more (e.g. > 100) it should always be shown
            if (selfUnitBase >= SuppressConfig.HierarchySuppress.unitSufficientBase) {
                return false;
            }
    
            var delta = SuppressConfig.HierarchySuppress.minGap;
            var parentBase = (bases.Length > 1) ? bases[1].Value : selfUnitBase;
            var allSiblingsBase = 0;
            for (var i=2; i<bases.Length; i++) {
                allSiblingsBase += bases[i].Value;
            }
    
    
            // 2. Hide a unit when there are small siblings next to it or few people are connected directly to its parent node
            if (parentBase - selfUnitBase && parentBase - selfUnitBase <= delta) {
                return true;
            }
    
            // 3. Hide a unit if too few people are connected directly to the parent node
            if (parentBase - allSiblingsBase && parentBase - allSiblingsBase <= delta) {
                return true;
            }
    
    
            // Additional check for Results table with breakdown by child hierarchy level
            var pageId = pageContext.Items['CurrentPageId'];
            if (pageId === 'Results' && !state.Parameters.IsNull('p_Results_BreakBy'))  {  // break by option is active
    
                var selectedOption = ParamUtil.GetSelectedOptions(context, 'p_Results_BreakBy')[0];
                var questionInfo = QuestionUtil.getQuestionInfo(context, selectedOption.Code);
    
                if(questionInfo.standardType === 'hierarchy') {
    
                    bases = report.TableUtils.GetColumnValues("Confidentiality:HierarchyTableForResults",1);
                    selfUnitBase = bases[0].Value;
                    var childrenBase = 0;
                    for (var i=1; i<bases.Length; i++) {
                        childrenBase += bases[i].Value;
                    }
    
                    // Equivalent to item #3: Hide a unit if there is too small gap between level and its children, i.e. too few people are connected directly to the node itself
                    if (selfUnitBase - childrenBase <= delta) {
                        return true;
                    }
                }
            }
            return false;
        }
    
    
        static function isGloballyHidden (context) {
    
            return reportBaseIsLow (context) || hierarchyUnitIsSensitive (context);
    
        }
    
    
        static function message (context) {
    
            if (reportBaseIsLow (context))
                return TextAndParameterUtil.getTextTranslationByKey(context, 'LowReportBaseWarning');
    
            if (hierarchyUnitIsSensitive (context))
                return TextAndParameterUtil.getTextTranslationByKey(context, 'SensitiveHierarchy');
    
            return '';
        }
    
    
        /**
         * @memberof SuppressUtil
         * @function message_Hide
         * @description function to hide the global warning message
         * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         * @returns {Boolean}
         */
        static function message_Hide(context){
    
            var pageContext = context.pageContext;
            var log = context.log;
    
            // data suppression isn't applied to Response Rate page, so no warning is displayed
            if (pageContext.Items['CurrentPageId'] === 'Response_Rate' || pageContext.Items['CurrentPageId'] === 'Actions') {
                return true;
            }
            return !(SuppressUtil.reportBaseIsLow (context) || SuppressUtil.hierarchyUnitIsSensitive (context));
        }
      
         /**
      * @memberof SuppressUtil
      * @function buildReportBaseTableForHitlist
      * @description function to render the Base table. It is used for suppressing Hitlist to check base
      * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
      * @param {String []} openTextQIds - the array of open text question ids the hitlist contains
      * @param {String []} tagQIds - the array of tag question ids the hitlist contains
      */
        static function buildReportBaseTableForHitlist (context, openTextQIds, tagQIds){
    
            var log = context.log;
            var table = context.table;
    
            // add rows = open text questions
            for (var i=0; i<openTextQIds.length; i++) {
                var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, openTextQIds[i]);
                var row : HeaderQuestion = new HeaderQuestion(qe);
                row.IsCollapsed = true;
                row.ShowTotals = false;
                row.Distributions.Enabled = true;
                row.Distributions.Count = true;
                table.RowHeaders.Add(row);
            }
    
            // add columns = tag questions as nested headers
    
            var placement = table.ColumnHeaders;
            for (i=0; i<tagQIds.length; i++) {
                qe = QuestionUtil.getQuestionnaireElement(context, tagQIds[i]);
                var col : HeaderQuestion = new HeaderQuestion(qe);
                col.IsCollapsed = false;
                col.ShowTotals = false;
                placement.Add(col);
                placement = col.SubHeaders;
            }
    
            table.Distribution.Enabled = true;
            table.Distribution.Count = true;
            table.RemoveEmptyHeaders.Columns = true;
        }  
    
    
    }