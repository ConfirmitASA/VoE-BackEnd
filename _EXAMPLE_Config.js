/*

public class Config {

  //================================================================================
  // THEME
  //================================================================================
  static const logo = '/isa/BDJPFRDMEYBPBKLVADAYFQCDAVIOEQJR/SA/tekshopBeatlogo_color_black.png';
  static const headerBackground = '#FFFFFF';
  static const primaryRedColor = '#c8a4a6';
  static const primaryGreenColor = '#a2ccc1';
  static const kpiColor = '#0098db';
  static const kpiColor_dark = '#0118A8';
  static const primaryGreyColor = '#E5E5E5';
  static var pieColors = ['#7ab800', '#ffa100', '#dadada', '#989898', '#ff6100']; // [negative, positive, neutral_dark, neutral_light]

  // Bar chart in the Results table. Check ReusableRecodingId to make sure colors match categories
  // There can only be 3 types of bars: Positive, Neutral and Negative
  // For instance [Very agree and Agree] are Positive, [Neutral] is neutral, [Somewhat negative, Negative and Very Negative] are Negative

  //static var barChartColors_Distribution = [{color: '#8dc444', label: 'Favourable', type: 'Positive'},
  //                               			  {color: '#d9dbd9', label: 'Neutral', type: 'Neutral'},
  //                               			  {color: '#f56e23', label: 'Unfavourable', type: 'Negative'}];

  static var barChartColors_Distribution = [{color: '#409AD2', label: 'Favourable', type: 'Positive'},
                               				{color: '#ECEDF2', label: 'Neutral', type: 'Neutral'},
                              				{color: '#BEC3C7', label: 'Unfavourable', type: 'Negative'}];


  static var barChartColors_NormVsScore = [{color: '#7ab800', label: 'Negative'},
                                 			{color: '#ffa100', label: 'Positive'}];

  static var showThreeDotsCardMenu = true;

//
// to update colors also go to 'Layout and Styles' section -> Styles -> Palletes -> EnnovaPallete
//

  static const Decimal = 0;

  //================================================================================
  // DATA SUPPRESSION (more info: SuppressUtil)
  //================================================================================

  static const SuppressSettings = {

    ReportBaseSuppressValue: 1,  // Min number of responses (response = question specified below in Survey Config -> Response: {qId: 'status', codes: ['complete']})

    TableSuppressValue: 1,        // Min number of answers in the Aggregated Table
    VerbatimSuppressValue: 0,     // Min number of answers in the Verbatim Table
    CommentSuppressValue: 2,      // Min number of answers in the Hitlist
    CategoricalSuppressValue: 0, // Min number of answers for cards on the Categorical page

    // minGap: min difference between neighbour units
    // unitSufficientBase: min number of the responses when a unit is always shown irrespective of <minGap> requirement
    HierarchySuppress: { minGap: 0, unitSufficientBase: 10}

  };

  // Database Hierarchy Descriptor

  static const schemaId = 8865;
  static const tableId = 19819;
  static const relationId = 12003;


  //================================================================================
  // README
  //================================================================================

  //
  // The following pattern is used for question ids: questionID.answer_precode.other.
  // SINGLE: single, single_ltr
  // GRID: grid, grid_ltr
  // GRID'S SUBQUESTION: grid.1, grid_ltr.1
  // OTHER ANSWER: q1_ltr.99.other
  // ANWSER OF OPEN TEXT LIST: open_text.answer_precode
  //


  static var Surveys = [

    //================================================================================
    // PULSE SURVEY
    //================================================================================
    {

      Source: 'ds1',
      isHidden: false,
      AvailableForRoles: null, // null - available for all roles, [] - not available for any role, ['role1', 'role2'] - available for 2 roles
      Filters: [],  // filters used on the Filter Panel
      FiltersFromSurveyData: [], //not bg vars only, used in filter panel
      IsTimePeriodFilterHidden: true,
      HierarchyQuestion: 'hierarchy',
      WaveQuestion: 'wave',
      DateQuestion: 'interview_end',
      MailingDateQuestion: 'smtpStatusDate',
      Invitation: {qId: 'smtpStatus', codes: ['messagesent']},
      Response: {qId: 'status', codes: ['complete']},
      ReusableRecodingId:  'rec0', // for distribution on results page
      ReusableRecoding_PositiveCols: [3],
      ReusableRecoding_NegativeCols: [1],
      NA_answerCode: null,
      DefaultPage: 'KPI',

      DimensionsForSurveysSchemaId: null,
      DimensionsForSurveysTable: null,

      // Page Key KPI

      Page_KPI: {
        isHidden: false,
        KPI: ['q289_1','q286_1', 'thebeatimprovement'],
        KPIPositiveAnswerCodes: ['9','10'],
        KPINegativeAnswerCodes: ['0','1','2','3','4','5','6'],
        KPIthreshold: [{score: 70, color: '#36842D'}, {score: 4, color: '#7e8286'}, {score: 0, color: '#8B565A'}],
        KPIComment: 'q291',
        NumberOfCommentsToShow: 10 // default - 5
      },

      // Page Trend

      Page_Trends: {
        isHidden: true,
        TrendQuestions: ['q289_1','q286_1']
      },

      // Page Results

      Page_Results: {
        isHidden: false,
        //row settings
        Dimensions: ['eNPS','Myself', 'My_team', 'My_manager', 'About_guests', 'My_hotel', 'Improvements', 'Comments'],
        ResultStatements: null,
        BreakVariables : ['hierarchy'],
        BreakByTimeUnits: false,
        ScoreType: '%Fav-%Unfav',

        //col settings
        showPrevWave: true,
        BenchmarkProject: null,//'p1869664629',
        BenchmarkSet: [/*{Code: 'Norm_Well', Label: { 9: 'The Well total', 20: 'The Well total'}}, ...}],
        HierarchyBasedComparisons: ['parent','1'] // parent - 1 level up, top - top hierarchy level, number - is specific level
      },


      // Page Comments

      Page_Comments: {
        isHidden: false,
        staticColumns: [],
        Comments: ['q291', 'comments'],
        ScoresForComments: ['q289_1'], // to display icons the copy of Score question should be used
        TagsForComments: ['wave'],
        BreakVariables : ['position', 'wave', 'hotel', 'yearsincompany', 'age', 'franchiseoperation', 'distribution', 'chain', 'country', 'work_area'],
        BreakByTimeUnits: false
      },


      // Page Response Rate

      Page_Response_Rate: {
        isHidden: false,
        DemographicsQuestions: ['hierarchy']
      },

      // Page Categorical

      Page_Categorical_: {
        isHidden: false,
        ResultCategoricalQuestions: ['Medarbeidersamtale'],    // single-questions for upper cards
        ResultMultiCategoricalQuestions: [],  // multi-questions for bottom cards
        topN_single: 3, // number of top options displayed in cards with singles
        topN_multi: 3, // number of top options displayed in cards with multies
        categoricalAnswerLimit: 4 // if single has more than <categoricalAnswerLimit> answers, it is displayed as topN card. If it has <= categoricalAnswerLimit answers, a pie chart is displayed.
      },

      // Page Categorical Drilldown
      Page_CategoricalDrilldown: {
        isHidden: false,
        BreakVariables : ['wave'],
        BreakByTimeUnits: false
      },

      // Page Actions
      Page_Actions: {
        Source: 'ds6',
        SurveyLink: 'https://survey.euro.confirmit.com/wix/p1873736708.aspx',
        Dimensions: [{Code: 'eNPS', Label: { 9: 'eNPS'}}, {Code: 'Myself', Label: { 9: 'Myself'}},{Code: 'My_team', Label: { 9: 'My team'}}, {Code: 'My_manager', Label: { 9: 'My manager'}},{Code: 'About_guests', Label: { 9:'About guests'}}, {Code: 'My_hotel', Label: { 9: 'My hotel'}},{Code: 'Improvements', Label: { 9:'Improvements'}}, {Code: 'Comments', Label: { 9: 'Comments'}}],
        Statements: ['q289_1', 'q286_1', 'q265_1', 'q265_2', 'q264_1', 'q264_2', 'q263_1', 'q263_2', 'q263_3', 'q262_1', 'q262_2', 'q261_1', 'q261_2','q260_1', 'q260_2', 'q260_3', 'q259_1', 'q259_2', 'q259_3', 'q258_1', 'q258_2', 'q258_3', 'q257_1', 'q257_2', 'q257_3'],
        isHidden: false,
        PageSpecificFilters: ['actionstatus', 'active', 'duehidden'],
        staticColumns: ['action_txt', 'questionText', 'duedate', 'last_touched', 'actionstatus'],
        TagsForHitlist: ['duehidden', 'actionowner'],
        KPI: {qId: 'actionstatus', codes: ['3']}, // Implemented actions
        KPIthreshold: [{score: 0, color: '#36842D'}, {score: 1, color: '#7e8286'}, {score: 2, color: '#8B565A'}],
        Breakdown: 'dimension',
        Trend: [{qId: 'actionstatus', code: ['3'], date: 'implementedDate'}, {qId: 'actionstatus', code: ['1'], date: 'regDate'}] // NB: Trend supports only 2 series

      }

    }


  ];


}

*/