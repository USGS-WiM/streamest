//------------------------------------------------------------------------------
//----- Notification ---------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Manage Notifications
//          
//discussion:
//
//Comments
//08.10.2016 jkn - Created
//Imports"
// Interface
var StreamEst;
(function (StreamEst) {
    var Models;
    (function (Models) {
        var Notification = (function () {
            // Constructor
            function Notification(message, ntype, title, showcloseButton, timeout, id) {
                if (ntype === void 0) { ntype = NotificationType.e_info; }
                if (title === void 0) { title = ''; }
                if (showcloseButton === void 0) { showcloseButton = false; }
                if (timeout === void 0) { timeout = 5000; }
                if (id === void 0) { id = null; }
                this.type = this.getType(ntype);
                this.title = title;
                this.timeout = timeout;
                this.toastId = id;
                this.showCloseButton = showcloseButton;
                this.body = message;
            }
            Notification.prototype.getType = function (nType) {
                switch (nType) {
                    case NotificationType.e_error: return 'error';
                    case NotificationType.e_info: return 'info';
                    case NotificationType.e_success: return 'success';
                    case NotificationType.e_wait: return 'wait';
                    case NotificationType.e_warning: return 'warning';
                } //end switch
            };
            return Notification;
        }());
        Models.Notification = Notification; //end class
        (function (NotificationType) {
            NotificationType[NotificationType["e_error"] = -1] = "e_error";
            NotificationType[NotificationType["e_info"] = 0] = "e_info";
            NotificationType[NotificationType["e_wait"] = 1] = "e_wait";
            NotificationType[NotificationType["e_success"] = 2] = "e_success";
            NotificationType[NotificationType["e_warning"] = 3] = "e_warning";
        })(Models.NotificationType || (Models.NotificationType = {}));
        var NotificationType = Models.NotificationType;
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module  
//# sourceMappingURL=Notification.js.map