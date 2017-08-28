function TaaSOperation() {
}


TaaSOperation.OPMODE = {
    NORMAL: 0,
    MAINTENANCE: 1
};


TaaSOperation.ROUTE_TYPES = [
    'get',
    'post'
];


TaaSOperation._opmode = TaaSOperation.OPMODE.NORMAL;
TaaSOperation._normalRoutes = {};


TaaSOperation._displayMaintenance = function(req, res, next) {
    res.end(
        '<h1>Service Unavailable</h1>' +
            '<p>TaaS is currently under system maintenance.</p>' +
            '<p>You may try to reload the page in a while.</p>' +
            '<p>Please contact us if there is any problem.</p>' +
            '<p><a href="/resume" style="color:white;">Resume service</a></p>'
    );
};


TaaSOperation._displayResume = function(req, res, next) {
    TaaSOperation.switchMode(TaaSOperation.OPMODE.NORMAL);
    res.end('<a href="/">Back to TaaS main page</a>');
};


TaaSOperation._switchToMaintenance = function() {
    if (TaaSOperation._opmode == TaaSOperation.OPMODE.NORMAL) {
        TaaSOperation._normalRoutes = {};
        for (var routeTypeIdx in TaaSOperation.ROUTE_TYPES) {
            var routeType = TaaSOperation.ROUTE_TYPES[routeTypeIdx];
            // save current route mapping
            TaaSOperation._normalRoutes[routeType] = APP.routes[routeType];
            // clear current route mapping
            APP.routes[routeType] = [];
        }
        // insert maintenance page routing
        APP.get('/resume', TaaSOperation._displayResume);
        APP.get('/*', TaaSOperation._displayMaintenance);

        console.error('switch to maintenance operation mode');
        TaaSOperation._opmode = TaaSOperation.OPMODE.MAINTENANCE;
    }
};


TaaSOperation._switchToNormal = function() {
    if (TaaSOperation._opmode == TaaSOperation.OPMODE.MAINTENANCE) {
        for (var routeTypeIdx in TaaSOperation.ROUTE_TYPES) {
            var routeType = TaaSOperation.ROUTE_TYPES[routeTypeIdx];
            // restore original route mapping
            if (TaaSOperation._normalRoutes[routeType]) {
                APP.routes[routeType] = TaaSOperation._normalRoutes[routeType];
            }
            else {
                APP.routes[routeType] = [];
            }
        }

        console.error('switch to normal operation mode');
        TaaSOperation._opmode = TaaSOperation.OPMODE.NORMAL;
    }
};


TaaSOperation.switchMode = function(opmode) {
    switch (opmode) {
        case TaaSOperation.OPMODE.NORMAL:
            TaaSOperation._switchToNormal();
            break;
        case TaaSOperation.OPMODE.MAINTENANCE:
            TaaSOperation._switchToMaintenance();
            break;
        default:
            console.error('Invalid TaaS operation mode: ' + opmode);
    }
};


module.exports.TaaSOperation = TaaSOperation;
