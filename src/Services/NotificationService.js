//------------------------------------------------------------------------------
//----- NotificationService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//06.16.2015 mjs - Created
//Import
var StreamEst;
(function (StreamEst) {
    var Services;
    (function (Services) {
        'use strict';
        Services.onNotify = "onNotify";
        Services.onClearNotifications = "onClearNotifications";
        var NotifictionEventArgs = (function (_super) {
            __extends(NotifictionEventArgs, _super);
            function NotifictionEventArgs(id, message, ntype, title, showcloseButton, timeout) {
                if (id === void 0) { id = null; }
                if (ntype === void 0) { ntype = NotificationType.e_info; }
                if (title === void 0) { title = ''; }
                if (showcloseButton === void 0) { showcloseButton = false; }
                if (timeout === void 0) { timeout = 5000; }
                _super.call(this);
                this.ntype = ntype;
                this.msg = message;
                this.title = title;
                this.showClose = showcloseButton;
                this.timeout = timeout;
                this.id = id;
            }
            return NotifictionEventArgs;
        })(WiM.Event.EventArgs);
        Services.NotifictionEventArgs = NotifictionEventArgs;
        var NotificationService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function NotificationService(toaster, eventManager) {
                var _this = this;
                this.toaster = toaster;
                this.eventManager = eventManager;
                this.Identifier = Math.random() * Date.now();
                eventManager.AddEvent(Services.onNotify);
                this.eventManager.SubscribeToEvent(Services.onNotify, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onNotify(sender, e);
                }));
                eventManager.AddEvent(Services.onClearNotifications);
                this.eventManager.SubscribeToEvent(Services.onNotify, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onClearNotify(sender, e);
                }));
                console.log('inside constructor');
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NotificationService.prototype.Notify = function (notification) {
                //this.toaster.pop("info", "Information", "Querying Streamgages...", 0);
                this.toaster.pop(notification);
            };
            NotificationService.prototype.clearToasts = function (toastID) {
                if (toastID === void 0) { toastID = null; }
                this.toaster.clear(toastID);
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NotificationService.prototype.getType = function (nType) {
                switch (nType) {
                    case NotificationType.e_error: return 'error';
                    case NotificationType.e_info: return 'info';
                    case NotificationType.e_success: return 'success';
                    case NotificationType.e_wait: return 'wait';
                    case NotificationType.e_warning: return 'warning';
                } //end switch
            };
            //EventHandlers
            NotificationService.prototype.onNotify = function (sender, e) {
                var notification = {
                    type: this.getType(e.ntype),
                    title: e.title,
                    timeout: e.timeout,
                    toastId: e.id,
                    showCloseButton: e.showClose,
                    body: e.msg
                };
                this.Notify(notification);
            };
            NotificationService.prototype.onClearNotify = function (sender, e) {
                this.clearToasts(e.id);
            };
            return NotificationService;
        })(); //end class
        var NotificationServiceProvider = (function () {
            function NotificationServiceProvider() {
                this.$get.$inject = ['toaster', 'WiM.Event.EventManager'];
                console.log("notificationservicProvider new");
            }
            NotificationServiceProvider.prototype.$get = function (toaster, eventManager) {
                return new NotificationService(toaster, eventManager);
            };
            return NotificationServiceProvider;
        })();
        (function (NotificationType) {
            NotificationType[NotificationType["e_error"] = -1] = "e_error";
            NotificationType[NotificationType["e_info"] = 0] = "e_info";
            NotificationType[NotificationType["e_wait"] = 1] = "e_wait";
            NotificationType[NotificationType["e_success"] = 2] = "e_success";
            NotificationType[NotificationType["e_warning"] = 3] = "e_warning";
        })(Services.NotificationType || (Services.NotificationType = {}));
        var NotificationType = Services.NotificationType;
        factory.$inject = ['toaster', 'WiM.Event.EventManager'];
        function factory(toaster, eventManager) {
            return new NotificationService(toaster, eventManager);
        }
        angular.module('StreamEst.Services')
            .service('StreamEst.Services.NotificationService', factory);
    })(Services = StreamEst.Services || (StreamEst.Services = {}));
})(StreamEst || (StreamEst = {})); //end module  
//# sourceMappingURL=NotificationService.js.map