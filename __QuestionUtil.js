class QuestionUtil {


    /*
     * Get question info:
     * - Type: general, singleFromGrid, otherOpenText.
     * - Question Id
     * - Precode for single from grid and other
     * - QuestionnaireElement for this qid
     * @param {object} context object {state: state, report: report, log: log}
     * @param {string} questionId
     * @returns {object} questionInfo { type: string, qid: string, precode: string}
     */

    static function getQuestionInfo (context, questionId) {

        var log = context.log;
        var project : Project = DataSourceUtil.getProject(context);
        var question : Question = project.GetQuestion(questionId);
        var questionInfo = {};
        var splittedQuestionId;

        if(question!=null) { // single, multi, open, numeric, grid itself, open text list, numeric list

            questionInfo.type = 'general';
            questionInfo.standardType = ((String)(question.QuestionType)).toLowerCase();
            questionInfo.questionId = questionId;

        } else if(questionId.slice(-6) === '.other') { // other option of single or multi

            splittedQuestionId = splitStringByLastPoint(questionId.substr(0,questionId.lastIndexOf('.other')));

            questionInfo.type = 'otherOpenText';
            questionInfo.questionId = splittedQuestionId.beforeLastPoint;
            questionInfo.precode = splittedQuestionId.afterLastPoint;

        } else if(questionId.indexOf('.')>-1) { //check if it's single from grid, open text list or numeric list

            splittedQuestionId = splitStringByLastPoint(questionId);
            questionInfo.questionId = splittedQuestionId.beforeLastPoint;
            questionInfo.precode = splittedQuestionId.afterLastPoint;
            var q : Question = project.GetQuestion(questionInfo.questionId);
            if(q.QuestionType == QuestionType.Grid) {
                questionInfo.type = 'singleFromGrid';
            } else if(q.QuestionType == QuestionType.MultiNumeric) {
                questionInfo.type = 'numericFromList';
            } else if(q.QuestionType == QuestionType.MultiOpen) {
                questionInfo.type = 'openFromList';
            }
        } else { // question is not found
            throw new Error('QuestionUtil.questionInfo: Question "'+questionId+'" is not found for ds '+DataSourceUtil.getDsId(context));
        }

        return questionInfo;
    }

    /*
     * Get Questionnaire Element.
     * @param {object} context object {state: state, report: report, log: log}
     * @param {string} questionId
     * @returns {QuestionnaireElement} qe
     */

    static function getQuestionnaireElement(context, questionId) {

        var log = context.log;
        var questionInfo =  getQuestionInfo (context, questionId);
        var project : Project = DataSourceUtil.getProject(context);

        var qe: QuestionnaireElement;

        if(questionInfo.type==='general') {  // simple question type: single, open text, grid overall, hierarchy
            return project.CreateQuestionnaireElement(questionInfo.questionId);
        }

        if (questionInfo.type == 'singleFromGrid' || questionInfo.type == 'numericFromList' || questionInfo.type == 'openFromList') {
            return project.CreateQuestionnaireElement(questionInfo.questionId, questionInfo.precode);
        }

        if (questionInfo.type == 'otherOpenText') {
            return project.CreateQuestionnaireElement(questionInfo.questionId, questionInfo.precode, true);
        }

        return;
    }

    /*
     * Get question title for card titles and parameter lists.
     * @param {object} context object {state: state, report: report, log: log}
     * @param {string} questionId
     * @returns {string} title question title
     */

    static function getQuestionTitle (context, questionId) {

        var log = context.log;
        var project : Project = DataSourceUtil.getProject(context);
        var questionInfo = getQuestionInfo(context, questionId);
        var question : Question = project.GetQuestion(questionInfo.questionId);
        var title;
        var answer: Answer;
        var NA = TextAndParameterUtil.getTextTranslationByKey(context, 'NoQuestionTitle')+question.QuestionId;

        if(questionInfo.type==='general') {  // simple question type: single, open text, grid overall
            return question.Title || question.Text || NA;
        }

        if (questionInfo.type == 'singleFromGrid') {  // TO DO: single from grid has no label, get title from grid question itself
            answer = question.GetAnswer(questionInfo.precode);
            return answer.Text || question.Title || question.Text || NA;
        }

        if (questionInfo.type == 'otherOpenText') {
            title = question.Title || question.Text;
            answer = question.GetAnswer(questionInfo.precode);
            return ((title || answer.Text) ? (title+': '+answer.Text) : NA) + ' (Other)';
        }

        if (questionInfo.type == 'openFromList' || questionInfo.type == 'numericFromList') {
            answer = question.GetAnswer(questionInfo.precode);
            title = (question.Title || question.Text);
            return (title || answer.Text) ? (title+': '+answer.Text) : NA;
        }

    }

    /*
     * Get question answer list.
     * @param {object} context object {state: state, report: report, log: log}
     * @param {string} questionId
     * @returns {Answer []} answers or scale for grids
     */

    static function getQuestionAnswers (context, questionId) {

        var state = context.state;
        var report = context.report;
        var log = context.log;
        var project : Project = DataSourceUtil.getProject(context);
        var questionInfo = getQuestionInfo(context, questionId);
        var question : Question = project.GetQuestion(questionInfo.questionId);
        var qType = question.QuestionType;
        var answers : Answer[];

        if(questionInfo.type==='general' && !questionInfo.precode && qType!= QuestionType.OpenText && qType!= QuestionType.Numeric && qType!= QuestionType.Date) {
            return question.GetAnswers();
        }

        if (questionInfo.type == 'singleFromGrid') { // probably it's an sub-question of a grid
            return question.GetScale();
        }

        // answers are not found
        throw new Error('QuestionUtil.getQuestionAnswers: Question '+questionId+' has no answer list. Check if it\'s open text question without \'single in reporting\' property.');

    }



    /*
     * Check if a question has a specific answer code.
     * @param {object} context object {state: state, report: report, log: log}
     * @param {string} questionId
     * @param {string} answerCode
     * @returns {boolean}
     */
    static function hasAnswer (context, questionId, answerCode) {
        var state = context.state;
        var report = context.report;
        var log = context.log;

        var answers = getQuestionAnswers(context, questionId);
        for (var k=0; k<answers.length; k++) {
            if (answers[k].Precode === answerCode) {
                return true;
            }
        }
        return false;
    }


    /* split string by "." sign (see comments in Config regarding question id's notation)
     * @param {string}
     * @returns {object} { beforePoint: beforeLastPoint, afterLastPoint: afterLastPoint}
     */

    static function splitStringByLastPoint (string) {

        var positionOfLastPoint = string.lastIndexOf('.'); // grid: gridId.answerId
        var beforeLastPoint = string.substring(0,positionOfLastPoint);
        var afterLastPoint = string.substring(positionOfLastPoint+1, string.length);

        return { beforeLastPoint: beforeLastPoint, afterLastPoint: afterLastPoint};
    }

    /* split string by "." sign (see comments in Config regarding question id's notation)
   * @param {string} questionId with dot
   * @returns {string} questionId with underscore instead of dot
   */

    static function getQuestionIdWithUnderscoreInsteadOfDot (questionIdWithDot) {

        return questionIdWithDot.replace(/\./g,'_');
    }

    /**
       * Get questions be category
       * @param {object} context object {state: state, report: report, log: log}
       * @param {string} category
       * @returns {array} - Question[]
       */
    static function getQuestionsByCategory (context, category) {
        var state = context.state;
        var report = context.report;
        var log = context.log;

        if (category) {
            var project : Project = DataSourceUtil.getProject(context);
            return project.GetQuestions({'InCategories': [category]});
        }
        return [];
    }

    /*
   * Get questions ids by category
   * @param {object} context object {state: state, report: report, log: log}
   * @param {string} category
   * @returns {array} - String[]
   */
    static function getQuestionIdsByCategory (context, category) {

        // see EN-430
        var log = context.log;
        var questions = getQuestionsByCategory (context, category);
        var questionIds = [];

        for(var i=0; i<questions.length; i++) {
            var q: Question = questions[i];
            questionIds.push(q.QuestionId);
        }
        return questionIds;
    }


    /*
    * Get custom question text / title by question id from DB table or cache
    * @param {object} context object {state: state, report: report, log: log}
    * @param {string} qId
    * @returns {string} - custom question text / title
    */
    static function getCustomQuestionTextById(context, qId) {
        var log = context.log;
        var confirmit = context.confirmit;
        var state = context.state;

        if(!qId) {
            throw new Error('QuestionUtil.getCustomQuestionTextById: expected custom question Id');
        }

        var codes = ParamUtil.GetSelectedCodes(context, 'p_projectSelector');
        if (codes.length == 0)
            return null;

        var cachedTxt;
        var baby_p_number = codes[0];

        // Redis is not available in export
        if (state.ReportExecutionMode == ReportExecutionMode.Web) {
            cachedTxt = confirmit.ReportDataCache(baby_p_number+"_"+qId);
        }

        // if Redis doesn't have cached question, look it up in the DB table
        if (!cachedTxt) {
            var schemaId = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'CustomQuestionsSchemaId');
            var tableName = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'CustomQuestionsTable');
            if(schemaId && tableName) { // storage for baby survey custom questions
                var schema: DBDesignerSchema = context.confirmit.GetDBDesignerSchema(schemaId);
                var table: DBDesignerTable = schema.GetDBDesignerTable(tableName);
                var custom_id = baby_p_number+"_"+qId;
                var custom_texts = table.GetColumnValues("__l9", "id", custom_id);
                if (custom_texts.Count) {
                    cachedTxt = custom_texts[0];
                    if (state.ReportExecutionMode == ReportExecutionMode.Web) {
                        confirmit.ReportDataCache(custom_id, cachedTxt); // save the found value to the cache
                    }
                }
            }
        }
        return cachedTxt;
    }

}
