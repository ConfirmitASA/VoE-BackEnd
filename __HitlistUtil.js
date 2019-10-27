class Hitlist {
    
      
      /**
         * @memberof Hitlist
         * @function hitlist_Hide
         * @description function to hide the hitlist
         * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         * @param {String} baseTable - table name to check base for the hitlist
         * @param {String} parameterWithOpenText (Optional) - parameter with open text questions used to populate the hitlist
         * @returns {Boolean}
         */
        static function hitlistComments_Hide(context, baseTable, parameterWithOpenText){
    
            if (SuppressUtil.isGloballyHidden(context)) {
                return true;
            }
    
            // if the parameter is passed and no open texts available, the hitlist should be hidden
            if(parameterWithOpenText && ParamUtil.GetSelectedCodes (context, parameterWithOpenText).length === 0) {
                return true;
            }
    
            var log = context.log;
            var report = context.report;
    
            // check base value in each table cell. If at least 1 value is less than Config.CommentSuppressValue, the whole hitlist is hidden
            for (var k=0; k<report.TableUtils.GetColumnHeaderCategoryIds(baseTable).length; k++) {
                var counts : Datapoint[] = report.TableUtils.GetColumnValues(baseTable, k+1);
                for (var i=0; i<counts.Length; i++) {
                    var base = parseInt(counts[i].Value);
                    if (base < SuppressConfig.CommentSuppressValue) {
                        return true;
                    }
                }
            }
            return false;
        }
      
      
        /**
         * @memberof Hitlist
         * @instance
         * @function AddColumn
         * @description function to add a variable to the hitlist
         * @param {Object} context
         * @param {String} qId - qiestion Id
         * @param {Object} columnProps - {
         *          order: {Int} - column number to insert
         *          sortable: {Boolean}
         *          searchable: {Boolean}
         *      }
         */
        static function AddColumn(context, qId, columnProps) {
    
            var hitlist = context.hitlist;
            var log = context.log;
    
            var sortable = columnProps.sortable || false;
            var searchable = columnProps.searchable || false;
            var order = columnProps.order;
    
            var qe : QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, qId);
            var column : HitListColumn = new HitListColumn();
            column.QuestionnaireElement = qe;
            column.IsLink = false;
            column.IsSearchable = searchable;
            column.IsSortable = sortable;
            if (order) {
                hitlist.Columns.Insert(order, column);
            } else {
                hitlist.Columns.Add(column);
            }
    
        }
    
    
        // check documentation.js on description format
        /**
         * @memberof Hitlist
         * @instance
         * @function AddColumnsByParameter
         * @description function to add a variable to the hitlist
         * @param {Object} context
         * @param {String} parameter - the name of the report parameter
         * @param {Object} columnProps  - {
         *          sortable: {Boolean}
         *          searchable: {Boolean}
         *      }
         */
    
        static function AddColumnsByParameter(context, parameterName, columnProps) {
            var hitlist = context.component;
            var log = context.log;
    
            var qIds = ParamUtil.GetSelectedCodes (context, parameterName);
         
            for (var i=0; i<qIds.length; i++) {          
                AddColumn(context, qIds[i], columnProps);
            }
    
        }
    
    
    
    
        /**
         * @memberof Hitlist
         * @instance
         * @function AddColumn
         * @description function to add a variable to the hitlist
         * @param {Object} context
         */
        static function AddSurveyLink(context) {
    
            var hitlist = context.hitlist;
            var log = context.log;
    
            var slink = new Confirmit.Reportal.Scripting.VisualComponents.SurveyLinkModel.SurveyLink();
            slink.Name = 'surveylink';
            slink.SurveyLinkType = Confirmit.Reportal.Scripting.VisualComponents.SurveyLinkModel.SurveyLinkType.Encrypted;
            slink.UrlParameters = "userid=^userid^;role=^role^";
    
            var slinkColumn : HitListColumn = new Confirmit.Reportal.Scripting.VisualComponents.HitListModel.HitListColumn(slink);
            hitlist.Columns.Add(slinkColumn);
        }
      
      
          
        /**
         * @memberof Hitlist
         * @function GetTagColumnNumbers
         * @description function to get the numbers of columns with tags.
         * @param {Object} context - {component: hitlist, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         * @param {String} parameterWithScores (Optional) - parameter with score questions used to populate the hitlist
         * @param {String} parameterWithTags (Optional) - parameter with tag questions used to populate the hitlist
         * @return {Int []} - array with numbers of columns
         */
        static function GetTagColumnNumbers (context, parameterWithScores, parameterWithTags) {
    
            var log = context.log;
            var state = context.state;
            
            const fixedColumnCount = 3; // Hitlist always contains 1 verbatim + 2 first hidden columns with system fields: Respondent ID and Survey Id.
            var tagColumnNumbers = [];
          
            var numberOfScoresColumns = parameterWithScores ? ParamUtil.GetSelectedCodes (context, parameterWithScores).length : 0;
            var numberOfColumnsAtStart = fixedColumnCount + numberOfScoresColumns; 
            var numberOfTagColumns = parameterWithTags ? ParamUtil.GetSelectedCodes (context, parameterWithTags).length : 0;
            for (var i=0; i<numberOfTagColumns; i++) {
                tagColumnNumbers.push(i + numberOfColumnsAtStart);
            }
            return tagColumnNumbers;
        }
    
    }