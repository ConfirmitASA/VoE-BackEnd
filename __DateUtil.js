class DateUtil {

    /*
     * Allows to define start and end date of time period defined in filters
     * @param {object} context {state: state, log: log}
     * @return {object} {startDate: start, endDate: end, startDateString: startString, endDateString: endString} - date period selected with filters
     */

    static function defineDateRangeBasedOnFilters(context) {

        var state = context.state;
        var log = context.log;

        var selectedTimePeriod = ParamUtil.GetSelectedOptions(context, 'p_TimePeriod')[0];
        if (selectedTimePeriod) { // time period is defined

            var now: DateTime = DateTime.Now;
            var start: DateTime = new DateTime (2000, 1, 1);  // if no StartDate is specified, set it to 1 Jan,2000 to reliably include all possible historical responses

            var end: DateTime = now;//.AddDays(1);

            if(selectedTimePeriod.TimeUnit === 'Year') { // time period is defined in years

                start = new DateTime(now.Year,1,1); // 1st January of this year
                start = start.AddYears(selectedTimePeriod.TimeUnitFrom); // plus number of years to roll back

                if(selectedTimePeriod.TimeUnitTo < 0) { // not current year
                    end = new DateTime(now.Year,1,1);
                    end = end.AddYears(selectedTimePeriod.TimeUnitTo+1);
                    end = end.AddDays(-1);
                }

            } else if(selectedTimePeriod.TimeUnit === 'Quarter') { // time period is defined in quarters

                var currentQuarter = Math.floor(now.Month/3);
                if(now.Month%3 === 0) {
                    currentQuarter -=1;
                }

                start = new DateTime(now.Year,1+currentQuarter*3,1); // 1st day of current quarter
                start = start.AddMonths(selectedTimePeriod.TimeUnitFrom*3); // each quarter consists of 3 months

                if(selectedTimePeriod.TimeUnitTo < 0) {
                    end = new DateTime(now.Year,1+currentQuarter*3,1);
                    end = end.AddMonths((selectedTimePeriod.TimeUnitTo+1)*3);
                    end = end.AddDays(-1);
                }

            } else if(selectedTimePeriod.TimeUnit === 'Month') { // time period is defined in months

                start = new DateTime(now.Year,now.Month,1);
                start = start.AddMonths(selectedTimePeriod.TimeUnitFrom);

                end = new DateTime(now.Year,now.Month,1);
                end = end.AddMonths(selectedTimePeriod.TimeUnitTo+1);
                end = end.AddDays(-1);

            } else if(selectedTimePeriod.Code === 'CUSTOM') {
                if(!state.Parameters.IsNull('p_DateFrom')) {
                    start = state.Parameters.GetDate('p_DateFrom');
                }
                if(!state.Parameters.IsNull('p_DateTo')) {
                    end = state.Parameters.GetDate('p_DateTo');
                }

            } else if(selectedTimePeriod.Code !== 'ALL') {
                throw new Error('DateUtil.defineDateRangeBasedOnFilters: Time period is selected, but there\'s not enough data to build interval.');
            }

            return {startDate: start, endDate: end, startDateString: formatDateTimeToString(start), endDateString: formatDateTimeToString(end)};
        }

        return {};
    }


    /* Transform DateTime into reportal suitable string format
     * @param {DateTime} dateTime
     * @return {string} "2019-03-31"
     */

    static function formatDateTimeToString(dateTime) {

        if(dateTime) {

            var year = dateTime.Year;
            var month = dateTime.Month <10 ? '0'+dateTime.Month : dateTime.Month;
            var day = dateTime.Day<10 ? '0'+dateTime.Day : dateTime.Day;
            return year+'-'+month+'-'+day;
        }

        return '';
    }
}