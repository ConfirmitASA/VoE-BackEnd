class PulseSurveysInfoFabric {

    static function getPulseSurveysInfo(context, storageInfo) {
        // for now the table is built manually, but when custom table synch is fixed, data will be taken from DB table
        // in addition to this method
        return PulseSurveys_ReportalTable.getInstance(context, storageInfo); 
    }
}