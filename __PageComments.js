class PageComments {
    
        /**
         * @memberof PageComments
         * @function Hide
         * @description function to hide the page
         * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         * @returns {Boolean}
         */
        static function Hide(context){
    
            return false;
        }
    
        /**
         * @memberof Page_comments
         * @function Render
         * @description function to render the page
         * @param {Object} context - {component: page, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         */
        static function Render(context){
    
        }
    
        /**
         * @memberof Page_comments
         * @function hitlistComments_Hide
         * @description function to hide the hitlist
         * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         * @returns {Boolean}
         */
        static function hitlistComments_Hide(context){
           var log = context.log;
           return Hitlist.hitlistComments_Hide(context, "Base", "p_AllOpenTextQs");
        }
    
        /**
         * @memberof Page_comments
         * @function hitlistComments_Render
         * @description function to render the hitlist
         * @param {Object} context - {component: hitlist, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
         */
        static function hitlistComments_Render(context){
    
            var log = context.log;
            var pageId = PageUtil.getCurrentPageIdInConfig(context);
    
            Hitlist.AddColumnsByParameter(context, "p_AllOpenTextQs", {sortable: true, searchable: false});
            Hitlist.AddColumnsByParameter(context, "p_ScoreQs", {sortable: true, searchable: false});
            Hitlist.AddColumnsByParameter(context, "p_TagQs", {sortable: false, searchable: false});
    
            var staticCols = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'staticColumns');
    
            for (var i=0; i<staticCols.length; i++) {
                Hitlist.AddColumn(context, staticCols[i], {sortable: true, searchable: true});
            }
        }
    
         /**
         * @memberof Page_comments
         * @function tableBase_Render
         * @description function to render the Base table used to check required base for Hitlist
         * @param {Object} context - {component: hitlist, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}     
         */
          static function tableBase_Render (context) {
              var open_Ids = ParamUtil.GetSelectedCodes (context, 'p_AllOpenTextQs');
              var tag_Ids = ParamUtil.GetSelectedCodes (context, 'p_TagQs');
              SuppressUtil.buildReportBaseTableForHitlist(context, open_Ids, tag_Ids);
          }

    }