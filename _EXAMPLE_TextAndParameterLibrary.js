/*

class TextAndParameterLibrary {

  //
  // 9 - English
  // 20 - Norwegian
  //

  static var ParameterValuesLibrary = {

   //
   // The standard options for the Code property are 'D', 'M', 'Q', 'Y'
   // Optionally, you can use Question ID for the Code property to have the answer list of a single question as time units
   //

    TimeUnitsWithDefaultValue: [

      { Code:'D',
       Label: { 9: 'By Day', 20: 'Om dagen'},
       TimeUnit:'Day',
       TimeUnitCount: null },

      { Code:'M',
       Label: { 9: 'By Month', 20: 'Etter måned' },
       TimeUnit:'Month',
       TimeUnitCount: null },

      { Code:'Q',
       Label: { 9: 'By Quarter', 20: 'Etter kvartal'},
       TimeUnit:'Quarter',
       TimeUnitCount: null },

      { Code:'Y',
       Label: { 9: 'By Year', 20: 'Etter år'},
       TimeUnit:'Year',
       TimeUnitCount: null },

      { Code:'wave',
       Label: { 9: 'By Wave', 20: 'By Wave'},
       TimeUnit:null,
       TimeUnitCount: null }

    ],

    TimeUnitsNoDefaultValue: [
      { Code:'na',
       Label: { 9: '', 20: '' },
       TimeUnit: null,
       TimeUnitCount: null },

      { Code:'D',
       Label: { 9: 'By Day', 20: 'Om dagen'},
       TimeUnit:'Day',
       TimeUnitCount: null },

      { Code:'M',
       Label: { 9: 'By Month', 20: 'Etter måned' },
       TimeUnit:'Month',
       TimeUnitCount: null },

      { Code:'Q',
       Label: { 9: 'By Quarter', 20: 'Etter kvartal'},
       TimeUnit:'Quarter',
       TimeUnitCount: null },

      { Code:'Y',
       Label: { 9: 'By Year', 20: 'Etter år'},
       TimeUnit:'Year',
       TimeUnitCount: null }

    ],

    TimePeriods: [

      { Code:'YTD',
       Label: { 9: 'Current Year', 20: 'Dette året' },
       TimeUnit:'Year',
       TimeUnitFrom: 0,
       TimeUnitTo: 0 },

      { Code:'QTD',
       Label: { 9: 'Current Quarter', 20: 'Nåværende kvartal' },
       TimeUnit:'Quarter',
       TimeUnitFrom: 0,
       TimeUnitTo: 0 },

      { Code:'MTD',
       Label: { 9: 'Current Month', 20: 'Denne måneden' },
       TimeUnit:'Month',
       TimeUnitFrom: 0,
       TimeUnitTo: 0 },

      { Code:'ALL',
       Label: { 9: 'All Time', 20: 'Hele tiden' },
       TimeUnit: null,
	  },

      { Code:'CUSTOM',
       Label: { 9: 'Custom Dates', 20: 'Tilpassede datoer' },
       TimeUnit: null,
	   }
    ],

    Distribution: [
      { Code:'P', Label: { 9: 'Percent', 20: 'Prosent' }},
      { Code:'C', Label: { 9: 'Counts', 20: 'Teller' }}
    ],

    DisplayMode: [
      { Code:'chart', Label: { 9: 'Chart', 20: 'Chart' }},
      { Code:'table', Label: { 9: 'Table', 20: 'Table' }}
    ],

    ResultsTabSwitcher: [
      { Code:'withDims', Label: { 9: 'Items By Dimension', 20: 'Elementer etter dimensjon' }},
      { Code:'noDims', Label: { 9: 'All Items', 20: 'Alle ting' }}
    ]
  };

  static var TextLibrary = {

    NoDataMsg: { 9: 'No data to display', 20: 'Ingen data å vise'},
    LowReportBaseWarning: {9: 'The results are hidden because the report base is low', 20: 'Resultatene er skjult fordi rapportbasen er lav' },
    SensitiveHierarchy: { 9: 'The results are hidden. Even though there are enough responses for the unit, there are small nearby hierarchy groups that could be identified if results for this unit was displayed.', 20: 'Resultatene er skjult. Selv om det er nok svar på enheten, er det små nærliggende hierarkigrupper som kan identifiseres hvis resultatene for denne enheten ble vist.' },

    ViewMore: { 9: 'Click to view more', 20: 'Klikk for å se mer'},
    CollectionPeriod: { 9: 'Collection Period', 20: 'Samlingsperiode'},
    Filters: { 9: 'Filters', 20: 'Filtre'},
    Invitations: { 9: 'Invitations', 20: 'Invitasjoner'},
    KPI: { 9: "I will recommend company to others.", 20: 'Jeg vil anbefale selskapet til andre.'},
    Responses: { 9: 'Responses', 20: 'Svar'},
    ResponseRate: { 9: 'Response Rate', 20: 'Svarprosent'},
    Score: { 9: 'Score', 20:'no: Score'},
    Survey: { 9: 'Survey', 20:'Undersøkelse'},
    Program: { 9: 'Program', 20:'no: Program'},
    PageIsNotAvailable: { 9: 'Page is not available for the selected program.', 20:'Siden er ikke tilgjengelig for det valgte programmet.'},
    TimePeriod: { 9: 'Time Period:', 20:'Tidsperiode:'},
    From: { 9: 'From:', 20:'Fra:'},
    To: { 9: 'To:', 20:'Til:'},
    Waves: { 9: 'Waves:', 20:'Waves:'},
    About: { 9: 'About', 20:'Handle om'},
    CollapseExpand: { 9: 'Collapse/Expand', 20:'Skjul/Utvid'},
    NoQuestionTitle: { 9: 'No question title/text is specified in survey for question ', 20:'Ingen spørsmålstittel / tekst er angitt i spørreundersøkelsen '},
    ReportBase: { 9: 'Report Base:', 20:'Rapport Base:'},

    Favourable: { 9: 'Favourable', 20: 'Gunstig'},
    Neutral: { 9: 'Neutral', 20:'Nøytral'},
    Unfavourable: { 9: 'Unfavourable', 20:'Ugunstig'},

    Positive: { 9: 'Positive', 20: 'Positiv'},
    Negative: { 9: 'Negative', 20:'Negativ'},
    ScoreVsNormValue: { 9: 'Score vs. Norm value', 20:'Resultat vs. Norm verdi'},
    Distribution: { 9: 'Distribution', 20:'Fordeling'},
    BenchmarkSet: { 9: 'Norm:', 20:'no: Norm:'},
    Fav: { 9: '%Fav', 20:'%Fav'},
    FavMinUnfav: { 9: '%Fav-%Unfav', 20:'%Fav-%Unfav'},
    BaseVP: { 9: 'Vertical Percent', 20:'Vertikal prosentsats'},

    Question: {9: 'Question:', 20: 'Spørsmål:'},
    ShowScoreBy: {9: 'Show score by:', 20: 'Vis poeng ved:'},
    TagQuestion: {9: 'Tag questions:', 20: 'Tag spørsmål:'},

    SelectQuestions: {9: 'Select questions:', 20: 'Velg spørsmål:'},
    TimeSeries: {9: 'Time series:', 20: 'Tidsserier:'},
    DisplayMode: {9: 'Chart vs. Table:', 20: 'Chart vs. Table:'},

    Results: { 9: 'Results', 20: 'Resultater'},
    BreakBy: { 9: 'Break by:', 20: 'no: Break by:'},
    BreakByTime: { 9: 'Time periods:', 20: 'no: Time periods:'},
    CountsVsPercents: { 9: 'Counts vs. Percent:', 20: 'Teller vs. Prosent:'},

    ResponseRateByTime: { 9: 'Response Rate By Time:', 20: 'Response Rate etter tid:'},
    ResponseRateDemographics: { 9: 'RESPONSE RATE DISTRIBUTION', 20: 'Response rate distribusjon'},
    DistributionBy: { 9: 'Distribution by:', 20: 'Fordeling av:'},

    KPI: { 9: 'KPI', 20: 'no: KPI'},
    CommentsPos: { 9: 'LATEST COMMENTS FROM MORE POSITIVE EMPLOYEES', 20: 'Siste kommentarer fra flere ansatte'},
    CommentsNeg: { 9: 'LATEST COMMENTS FROM MORE NEGATIVE EMPLOYEES', 20: 'Siste kommentarer fra flere negative ansatte'},
    KPITrend: { 9: 'Trends', 20: 'no: Trends'},
    SelectQsToFilterBy: { 9: 'Latest comments are filtered by:', 20: 'no: Latest comments are filtered by:'},

    Benchmark: { 9: 'Benchmark', 20: 'Benchmark'},

    KPI_InfoTooltip: { 9: 'This widget provides...', 20: 'Denne widgeten gir'},
    KPITrend_InfoTooltip: { 9: 'KPITrend_InfoTooltip', 20: 'TBD'},
    KPICommentPos_InfoTooltip: { 9: 'KPICommentPos_InfoTooltip', 20: 'TBD'},
    KPICommentNeg_InfoTooltip: { 9: 'KPICommentNeg_InfoTooltip', 20: 'TBD'},
    Trend_InfoTooltip: { 9: 'Trend_InfoTooltip', 20: 'TBD'},
    Results_InfoTooltip: { 9: 'Results_InfoTooltip', 20: 'TBD'},
    Categorical_InfoTooltip: { 9: 'Categorical_InfoTooltip', 20: 'TBD'},
    CategoricalDetails_InfoTooltip: { 9: 'CategoricalDetails_InfoTooltip', 20: 'TBD'},
    Comments_InfoTooltip: { 9: 'Comments_InfoTooltip', 20: 'TBD'},
    RR_InfoTooltip: { 9: 'RR_InfoTooltip', 20: 'TBD'},
    RRDistr_InfoTooltip: { 9: 'RRDistr_InfoTooltip', 20: 'TBD'},
    RRByTime_InfoTooltip: { 9: 'RRByTime_InfoTooltip', 20: 'TBD'},

    //page names should be specified here and in Titles property of every page
    Page_KPI: { 9: 'Key KPI', 20: 'Key KPI'},
    Page_Trends: { 9: 'Trends', 20: 'Trends'},
    Page_Results: { 9: 'Results', 20: 'Resultater'},
    Page_Categorical_: { 9: 'Non Standard Questions', 20: 'Ikke Standard Spørsmål'},
    Page_CategoricalDrilldown: { 9: 'Hidden Page', 20: 'Hidden Page'},
    Page_Comments: { 9: 'Comments', 20: 'Kommentarer'},
    Page_Response_Rate: { 9: 'Response Rate', 20: 'Svarprosent'}
  }
}

*/