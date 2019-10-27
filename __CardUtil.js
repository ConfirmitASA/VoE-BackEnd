class CardUtil {

    /**
     * @memberof CardUtil
     * @function RenderCard
     * @description function to generate material cards on KPI and Categorical pages
     * @param {Object} context - {state: state, report: report, log: log, text: text, pageContext: pageContext}
     */

    static function RenderCard (context, content, cssClass) {

        var report = context.report;
        var state = context.state;
        var text = context.text;
        var log = context.log;

        var title = content.title;
        var tooltip = content.tooltip;
        var hoverText = content.hoverText;
        var qid = content.qid;
        var data = content.data;


        var hover = (data != '') ? 'title="'+hoverText+'"' : '';

        var card = '<div class="material-card flex '+ cssClass+' ">'+
            '<div class="material-card__info">'+tooltip+'</div>'+
            '<div class="material-card__title">'+
            '<div class="material-card__title--left">'+title+'</div>'+
            '</div>'+
            '<div id="'+ qid +'" class="material-card__content" '+hover+'>'+data+
            '</div>'+
            '</div>';

        text.Output.Append(card);
    }
}