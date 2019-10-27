public class PulseSurveys_ReportalTable implements IPulseSurveysInfo {

    private var _visiblePulseSurveysTablePath : String; // "PulseSurveyData:VisibleSurveys" = "pageId:tableName"
    private var _isEmptyOptionNeeded: Boolean;

    /**
     * constructor
     * @param {Object} storageInfo - path to table that lists all existing pulse surveys (not filtered by userid)
     */
    private function PulseSurveys_ReportalTable(storageInfo) {
        _isEmptyOptionNeeded = storageInfo.isEmptyOptionNeeded;
        _visiblePulseSurveysTablePath = storageInfo.hasOwnProperty('visiblePulseSurveysTablePath') ? storageInfo.visiblePulseSurveysTablePath: "PulseSurveyData:VisibleSurveys";
    }

    /**
     * creates instance of PulseSurveys_ReportalTable class, should have check if instance is created already (singleton)
     */
    public static function getInstance(context, storageInfo){
        return new PulseSurveys_ReportalTable(storageInfo);
    }

    /**
     * implements interface
     * @param {Object} context {state: state, report: report, page: page, user:user, pageContext: pageContext, log: log, confirmit: confirmit}
     * @returns {Array} array of objects {Code: pid, Label: pname} for user's pulse surveys
     */
    public function getVisiblePulseSurveys(context) : Object[] {

        var report = context.report;
        var log = context.log;
        var rawInfo = report.TableUtils.GetRowHeaderCategoryTitles(_visiblePulseSurveysTablePath);
        var surveyList = [];

        if(_isEmptyOptionNeeded) {
            var emptyOption = {};
            emptyOption.Label = TextAndParameterUtil.getTextTranslationByKey(context, 'SelectSurveyEmptyOption');
            emptyOption.Code = 'none';
            surveyList[0] = emptyOption;
        }

        surveyList = surveyList.concat(transformTableHeaderTitlesIntoObj(context, rawInfo));

        return surveyList;
    }

    /**
     * help function that transforms string[][] array of row headers into array of standard objects
     * @param {String[][]} string[][] array of row headers
     * @returns {Array} array of objects {Code: pid, Label: pname} for user's pulse surveys
     */
    private function transformTableHeaderTitlesIntoObj(context, HeaderCategoryTitles) {

        var log = context.log;
        var surveyList = [];

        // reverse order
        for(var i=HeaderCategoryTitles.length-1; i>=0; i--) { // reverse order
            var surveyInfo = {};
            surveyInfo.Label = HeaderCategoryTitles[i][0]; //label - inner header
            surveyInfo.Code = HeaderCategoryTitles[i][1]; // pid - outer header
            surveyList.push(surveyInfo);            
        }

        return surveyList;
    }
}
