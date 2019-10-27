class StyleAndJavaScriptUtil {
    
    /*
    * Assemble all "backend dependant" css styles and js scripts
     * @param {object} context {state: state, report: report, log: log}
     * @returns {string} script and style string
     */

    static function assembleBackendDependantStylesAndJS (context) {

        var str = '';

        try {
            str += buildReportTemplateModule (context); //js
        } catch(e) {
            throw new Error('StyleAndJavaScriptUtil.buildReportTemplateModule: failed with error "'+e.Message+'"');
        }

        try {
            str += applyTheme(context); // css
        } catch(e) {
            throw new Error('StyleAndJavaScriptUtil.applyTheme: failed with error "'+e.Message+'"');
        }

        return str;
    }

    /**
     * Gather all styling settings that is used in js in one object
     */

    static function generateStyleModule(context) {

        var styleModule = {};

        styleModule.barChartColors_NormVsScore = Config.barChartColors_NormVsScore;
        styleModule.greyColor = Config.primaryGreyColor;

        return styleModule;
    }

    /**
     * Gather all translations in one object and return in JSON string format
     */
    static function generateTranslationsObject (context) {

        var log = context.log;
        var translations = {};

        // A
        translations['About'] = TextAndParameterUtil.getTextTranslationByKey(context, 'About');
        translations['Apply'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Apply');
        translations['Avg'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Avg');
        //C
        translations['CollapseExpand'] = TextAndParameterUtil.getTextTranslationByKey(context, 'CollapseExpand');
        translations['commentNumber'] = TextAndParameterUtil.getTextTranslationByKey(context, 'CommentNumber');
        //D
        translations['defaultPlaceholderTxt'] = TextAndParameterUtil.getTextTranslationByKey(context, 'BreakBy');
        //F
        translations['filters'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Filters');
        translations['From'] = TextAndParameterUtil.getTextTranslationByKey(context, 'From');
        //N
        translations['No data to display'] = TextAndParameterUtil.getTextTranslationByKey(context, 'NoDataMsg');
        translations['noDataWarning'] = TextAndParameterUtil.getTextTranslationByKey(context, 'NoDataMsg');
        //P
        translations['pageTitlePostfix'] = TextAndParameterUtil.getTextTranslationByKey(context, '_for');
        //R
        translations['ResetSorting'] = TextAndParameterUtil.getTextTranslationByKey(context, 'ResetSorting');
        translations['Reset'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Reset');
        //S
        translations['Sorting'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Sorting');
        translations['survey'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Survey');
        translations['score'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Score');
        translations['scrollUpToCardText'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Page_Categorical_ScrollUpToCardText');
        //T
        translations['TableChartColName_ScoreVsNormValue'] = TextAndParameterUtil.getTextTranslationByKey(context, 'ScoreVsNormValue');
        translations['TableChartColName_Distribution'] = TextAndParameterUtil.getTextTranslationByKey(context, 'Distribution');
        translations['tagPlaceholderTxt'] = TextAndParameterUtil.getTextTranslationByKey(context, 'TagQuestion');
        translations['To'] = TextAndParameterUtil.getTextTranslationByKey(context, 'To');
        //U
        translations['UpToCard'] = TextAndParameterUtil.getTextTranslationByKey(context, 'UpToCard');

        return translations;

    }

    /*
     * all js variables and functions that
     * - are specific to the template
     * - are defined based on Config
     * - therefore are build with help of Reportal scripting
     * will be properties of ReportTemplate global variable
     * The function below will build that variable.
     * @param {object} context {state: state, report: report, log: log}
     * @returns {string} script string
     */

    static function buildReportTemplateModule (context) {

        var log = context.log;
        var state = context.state;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
      
        var globalVarScript = [];
        var properties = []; // array of strings like 'property: propertyValue'

        // the place to define ReportTemplate's properties
        // examples
        // pagesToHide: [\'page1\', \'page2\']
        // logo: \'some url\';
        

        properties.push('logoLink:'+JSON.stringify(Config.logo));

        properties.push('executionMode: '+JSON.stringify(state.ReportExecutionMode));

        properties.push('pagesToShow: '+JSON.stringify(PageUtil.getPageNamesToShow(context).join(';').toLowerCase()+';'));

        properties.push('pageHasViewSwitch: '+JSON.stringify(PageUtil.isViewSwitchAvailable(context)));

        properties.push('hideTimePeriodFilters: '+Filters.isTimePeriodFilterHidden(context));

        properties.push('hideWaveFilter: '+Filters.isWaveFilterHidden(context));

        properties.push('Styling: '+JSON.stringify(generateStyleModule()));

        properties.push('translations:'+ JSON.stringify(generateTranslationsObject (context)));        

        if (pageContext.Items['CurrentPageId'] === 'CategoricalDrilldown') {
            properties.push('isProjectSelectorDisabled: '+true);
        }

        if (pageContext.Items['CurrentPageId'] === 'Comments') {
            properties.push('tagColumnNumbers: '+JSON.stringify(PageComments.getTagColumnNumbers (context)));
            properties.push('nonTagColumnsCount: '+JSON.stringify(PageComments.getNonTagColumnsCount (context)));
        }

        if (pageContext.Items['CurrentPageId'] === 'KPI') {
            properties.push('gaugeData: '+JSON.stringify(PageKPI.getKPIResult(context)));
            properties.push('gaugeType: '+JSON.stringify(DataSourceUtil.getPagePropertyValueFromConfig(context, "Page_KPI", "KPIType")));
            properties.push('gaugeThreshold: '+JSON.stringify(DataSourceUtil.getPagePropertyValueFromConfig(context, "Page_KPI", "KPIThreshold")));
        }

        if (pageContext.Items['CurrentPageId'] === 'Categorical_') {
            properties.push('pieData: '+JSON.stringify(PageCategorical.getPieCollection(context)));
            properties.push('pieColors: '+JSON.stringify(Config.pieColors));

            if (!state.Parameters.IsNull('p_Drilldown') && state.Parameters.GetString('p_Drilldown')) {
                properties.push('drilldownId: ' + JSON.stringify(state.Parameters.GetString('p_Drilldown')));
            }
        }

        if (pageContext.Items['CurrentPageId'] === 'Wordclouds') {
            properties.push('wordcloudQuestionId: ' + JSON.stringify(ParamUtil.GetSelectedCodes(context, "p_WordcloudQs")));
            properties.push('wordcloudMainColor: ' + JSON.stringify(Config.wordcloudMainColor));
            properties.push('wordcloudSecondaryColor: ' + JSON.stringify(Config.wordcloudSecondaryColor));
        }

        if (pageId === 'Actions') {
            //properties.push('action_kpi: '+JSON.stringify(PageActions.getKPIResult(context)));
            properties.push('gaugeData: '+JSON.stringify(PageActions.getKPIResult(context)));
            properties.push('tagColumnNumbers: '+JSON.stringify(PageActions.getTagColumnNumbers (context)));
        }

        //export window
        properties.push('exportWindowFiles: {CSS_1page: ' + JSON.stringify(Config.exportWindowStylingFiles.page1CSS));
        properties.push('CSS_2page: ' + JSON.stringify(Config.exportWindowStylingFiles.page2CSS));
        properties.push('JS_1page: ' + JSON.stringify(Config.exportWindowStylingFiles.page1JS));
        properties.push('JS_2page: ' + JSON.stringify(Config.exportWindowStylingFiles.page2JS) + '}');

        var exportWindowOptions = getExportWindowOptions(context);

        properties.push('exportWindowOptionFlags: {pdf: ' + JSON.stringify(exportWindowOptions.flags.pdf));
        properties.push('excel: ' + JSON.stringify(exportWindowOptions.flags.excel));
        properties.push('excelScopeExt: ' + JSON.stringify(exportWindowOptions.flags.excelScopeExt));
        properties.push('ppt: ' + JSON.stringify(exportWindowOptions.flags.ppt)+'}');

        properties.push('exportWindowOptionIndexes: {pdf: ' + JSON.stringify(exportWindowOptions.indexes.pdf));
        properties.push('excel: ' + JSON.stringify(exportWindowOptions.indexes.excel));
        properties.push('excelScopeExt: ' + JSON.stringify(exportWindowOptions.indexes.excelScopeExt));
        properties.push('ppt: ' + JSON.stringify(exportWindowOptions.indexes.ppt)+'}');

        properties.push('executionMode: ' + JSON.stringify(state.ReportExecutionMode));

        properties.push('exportTranslations: {inQueueText: ' + JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'InQueue')));
        properties.push('completedText: ' + JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'Completed')));
        properties.push('errorText: ' + JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'Error'))+'}');


        globalVarScript.push('<script>');
        globalVarScript.push(';var ReportTemplateConfig = (function(){');
        globalVarScript.push('return {');
        globalVarScript.push(properties.join(', '));
        globalVarScript.push('}');
        globalVarScript.push('})();');
        globalVarScript.push('</script>');

        return globalVarScript.join('');
    }

    
    static function getExportWindowOptions(context) {
        var isEndUser = User.isEndUser(context);
        if (!isEndUser) {
          var exportWindowOptionFlags = {
            pdf: Config.pdfExportSettingsOptions.flags,
            excel: Config.excelExportSettingsOptions.flags,
            excelScopeExt: Config.excelScopeExtExportSettingsOptions.flags,
            ppt: Config.pptExportSettingsOptions.flags
          };
          var exportWindowOptionIndexes = {
            pdf: Config.pdfExportSettingsOptions.indexes,
            excel: Config.excelExportSettingsOptions.indexes,
            excelScopeExt: Config.excelScopeExtExportSettingsOptions.indexes,
            ppt: Config.pptExportSettingsOptions.indexes
          };
        } else {
          var exportWindowOptionFlags = {
            pdf: Config.pdfExportSettingsOptions.flags.slice(0, Config.encryptFileOptionIndex.pdf).concat(Config.pdfExportSettingsOptions.flags.slice(Config.encryptFileOptionIndex.pdf + 1)),
            excel: Config.excelExportSettingsOptions.flags.slice(0, Config.encryptFileOptionIndex.excel).concat(Config.excelExportSettingsOptions.flags.slice(Config.encryptFileOptionIndex.excel + 1)),
            excelScopeExt: Config.excelScopeExtExportSettingsOptions.flags.slice(0, Config.encryptFileOptionIndex.excelScopeExt).concat(Config.excelScopeExtExportSettingsOptions.flags.slice(Config.encryptFileOptionIndex.excelScopeExt + 1)),
            ppt: Config.pptExportSettingsOptions.flags.slice(0, Config.encryptFileOptionIndex.ppt).concat(Config.pptExportSettingsOptions.flags.slice(Config.encryptFileOptionIndex.ppt + 1))
          };
          var exportWindowOptionIndexes = {
            pdf: Config.pdfExportSettingsOptions.indexes.slice(0, Config.encryptFileOptionIndex.pdf).concat(Config.pdfExportSettingsOptions.indexes.slice(Config.encryptFileOptionIndex.pdf + 1)),
            excel: Config.excelExportSettingsOptions.indexes.slice(0, Config.encryptFileOptionIndex.excel).concat(Config.excelExportSettingsOptions.indexes.slice(Config.encryptFileOptionIndex.excel + 1)),
            excelScopeExt: Config.excelScopeExtExportSettingsOptions.indexes.slice(0, Config.encryptFileOptionIndex.excelScopeExt).concat(Config.excelScopeExtExportSettingsOptions.indexes.slice(Config.encryptFileOptionIndex.excelScopeExt + 1)),
            ppt: Config.pptExportSettingsOptions.indexes.slice(0, Config.encryptFileOptionIndex.ppt).concat(Config.pptExportSettingsOptions.indexes.slice(Config.encryptFileOptionIndex.ppt + 1))
          };
    
          for (var i = Config.encryptFileOptionIndex.pdf; i < exportWindowOptionIndexes.pdf.length; i++) {
            exportWindowOptionIndexes.pdf[i] = exportWindowOptionIndexes.pdf[i] - 1;
          }
          for (var i = Config.encryptFileOptionIndex.excel; i < exportWindowOptionIndexes.excel.length; i++) {
            exportWindowOptionIndexes.excel[i] = exportWindowOptionIndexes.excel[i] - 1;
          }
          for (var i = Config.encryptFileOptionIndex.excelScopeExt; i < exportWindowOptionIndexes.excelScopeExt.length; i++) {
            exportWindowOptionIndexes.excelScopeExt[i] = exportWindowOptionIndexes.excelScopeExt[i] - 1;
          }
          for (var i = Config.encryptFileOptionIndex.ppt; i < exportWindowOptionIndexes.ppt.length; i++) {
            exportWindowOptionIndexes.ppt[i] = exportWindowOptionIndexes.ppt[i] - 1;
          }
        }
    
        return {flags: exportWindowOptionFlags, indexes: exportWindowOptionIndexes};
      }

    static function applyTheme(context) {

        var log = context.log;
        var greenColor = Config.primaryGreenColor;
        var redColor = Config.primaryRedColor;
        var kpiColor = Config.kpiColor;
        var kpiColor_dark = Config.kpiColor_dark;
        var logo = Config.logo;
        var headerBackground = Config.headerBackground;
        var primaryGreyColor = Config.primaryGreyColor;
        var pieColors = Config.pieColors;
        var barChartColors = Config.barChartColors_Distribution;
        var isThreeDotsMenuNeeded = Config.showThreeDotsCardMenu;
        var numberOfVerbatimComments = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_KPI', 'NumberOfCommentsToShow');

        var css_string = '';

        css_string += ''

            //logo
            +'.logo-wrapper {'
            +'background-image: url("'+logo+'");'
            +'}'

            //icon with two men in queue
            +'.icon--kpi{'
            +'background-image: url(data:image/svg+xml,%3Csvg%20fill%3D%22%23'+kpiColor.substring(1,kpiColor.length)+'%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M16%2011c1.66%200%202.99-1.34%202.99-3S17.66%205%2016%205c-1.66%200-3%201.34-3%203s1.34%203%203%203zm-8%200c1.66%200%202.99-1.34%202.99-3S9.66%205%208%205C6.34%205%205%206.34%205%208s1.34%203%203%203zm0%202c-2.33%200-7%201.17-7%203.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8%200c-.29%200-.62.02-.97.05%201.16.84%201.97%201.97%201.97%203.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z%22/%3E%0A%3C/svg%3E);'
            +'}'

            //nav menu item color
            +'.css-menu .yui3-menuitem:hover > a'
            +'{ color: '+kpiColor+'  !important;}'
            +'div.reportal-horizontal-menu>.yui3-menu .css-menu-topitem:hover {'
            +'border-bottom-color:'+kpiColor+'!important;}'

            //header background
            +'.global-header {'
            +'background-color: '+headerBackground+';'
            +'}'

            // calendar
            +'.yui-calcontainer>table .calnav,'
            +'.yui-calcontainer>table td.calcell.today>a{'
            +'    background: '+kpiColor+' !important;'
            +'    color: white!important;'
            +'}'
            +'.yui-calcontainer>table .calnavleft:before,'
            +'.yui-calcontainer>table .calnavright:before{'
            +'border-color: '+kpiColor+';}'
            +'.yui-calcontainer>table .calnav:hover {'
            +'background: '+kpiColor_dark+' !important;}'

            //unfavorable card
            +'div .material-card.unfavorable,'
            +'.material-card.unfavorable .Table td'
            +'{ background-color: '+redColor+' !important;}'

            //favorable card
            +'div .material-card.favorable,'
            +'div .material-card.favorable .Table td'
            +'{background-color: '+greenColor+';}'



            //hitlist navigation
            +'div .hitlist-nav-button:hover, '
            +'div .hitlist-nav-page:hover {'
            +'background-color: '+kpiColor+' !important;'
            +'}'

            //loading animation colors (three blinking dots)
            +'@keyframes pulse { '
            +'from { background-color:'+kpiColor+';}'
            +'to { background-color:'+kpiColor_dark+';}'
            +'}';

        if(!isThreeDotsMenuNeeded) {
            css_string += '.material-card__title .kebab-menu { display: none; }';
        }


        //CSS to show only the latest n rows with comments
        if(numberOfVerbatimComments) {
            numberOfVerbatimComments = numberOfVerbatimComments + 1;
            css_string += '.material-card--favorable tr:nth-last-child(n+' + numberOfVerbatimComments + ') td { display: none; }'
                +'.material-card--unfavorable tr:nth-last-child(n+' + numberOfVerbatimComments + ') td { display: none; }';
        } else {
            css_string += '.material-card--favorable tr:nth-last-child(n+6) td { display: none; }'
                +'.material-card--unfavorable tr:nth-last-child(n+6) td { display: none; }';
        }

        return '<style>'+css_string+'</style>';
    }

    static function reportStatisticsTile_Render(context, stat, icon) {

        var log = context.log;
        var str = '';
        var value;

        switch(stat) {
            case 'collectionPeriod': value = PageResponseRate.getCollectionPeriod(context); break;
            default: value = PageResponseRate.getResponseRateSummary(context)[stat]; break;
        }

        str += '<div class="layout horizontal">'
            + '<div class="icon icon--'+icon+'"></div>'
            + '<div class="flex digit self-center">'+value+'</div></div>';

        return str;
    }


    

}
