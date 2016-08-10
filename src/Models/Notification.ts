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
module StreamEst.Models {
    export interface INotification {
        type: string,
        title?: string,
        body: string,
        timeout?: number,
        toastId?: number
        showCloseButton: boolean,
    }
    export class Notification implements INotification {
        //Properties
        public toastId: number;
        public type: string;
        public body: string;
        public title: string;
        public showCloseButton: boolean;
        public timeout: number;


        // Constructor
        constructor( message: string, ntype: NotificationType = NotificationType.e_info, title: string = '', showcloseButton: boolean = false, timeout: number = 5000,id: number = null) {
            this.type = this.getType(ntype);
            this.title = title;
            this.timeout = timeout;
            this.toastId = id;
            this.showCloseButton = showcloseButton;
            this.body = message;          
            
        }

        private getType(nType: NotificationType): string {
            switch (nType) {
                case NotificationType.e_error: return 'error';
                case NotificationType.e_info: return 'info';
                case NotificationType.e_success: return 'success';
                case NotificationType.e_wait: return 'wait';
                case NotificationType.e_warning: return 'warning';
            }//end switch
        }
    }//end class

    export enum NotificationType {
        e_error = -1,
        e_info = 0,
        e_wait = 1,
        e_success = 2,
        e_warning = 3,
    }

}//end module  