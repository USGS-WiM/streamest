//------------------------------------------------------------------------------
//----- NotificationService -----------------------------------------------------
//------------------------------------------------------------------------------

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
module StreamEst.Services {
    'use strict'
    export interface INotificationService {
        Identifier: number;
        Notify(notification: INotification):void;
        clearToasts(toastID?: Number): void;
    }
    export var onNotify: string = "onNotify";
    export var onClearNotifications: string = "onClearNotifications";
    export class NotifictionEventArgs extends WiM.Event.EventArgs {
        //properties
        public id: number;
        public ntype: NotificationType
        public msg: string;
        public title: string;
        public showClose: boolean;
        public timeout

        constructor(  id: number = null, message: string, ntype: NotificationType=NotificationType.e_info, title: string = '', showcloseButton:boolean = false, timeout:number = 5000) {
            super();
            this.ntype = ntype;
            this.msg = message;
            this.title = title;
            this.showClose = showcloseButton;
            this.timeout = timeout;
            this.id = id;
        }
    }
    export interface INotification {
        type: string,
        title?: string,
        body: string,
        timeout?: number,
        toastId?: number
        showCloseButton:boolean
    }
    class NotificationService implements INotificationService{       
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private toaster
        private eventManager: WiM.Event.IEventManager
        public Identifier: number;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(toaster, eventManager: WiM.Event.IEventManager) {
            this.toaster = toaster;
            this.eventManager = eventManager;

            this.Identifier = Math.random() * Date.now();

            eventManager.AddEvent<NotificationService>(onNotify);
            this.eventManager.SubscribeToEvent(onNotify, new WiM.Event.EventHandler<NotifictionEventArgs>((sender: any, e: NotifictionEventArgs) => {
                this.onNotify(sender, e);
            }));

            eventManager.AddEvent<NotificationService>(onClearNotifications);
            this.eventManager.SubscribeToEvent(onNotify, new WiM.Event.EventHandler<NotifictionEventArgs>((sender: any, e: NotifictionEventArgs) => {
                this.onClearNotify(sender, e);
            }));

            console.log('inside constructor');
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Notify(notification: INotification) {
            //this.toaster.pop("info", "Information", "Querying Streamgages...", 0);
            this.toaster.pop(notification);
        }        
        public clearToasts(toastID: Number=null) {
            this.toaster.clear(toastID);
        }

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

        private getType(nType: NotificationType): string {
            switch (nType) {
                case NotificationType.e_error: return 'error';
                case NotificationType.e_info: return 'info';
                case NotificationType.e_success: return 'success';
                case NotificationType.e_wait: return 'wait';
                case NotificationType.e_warning: return 'warning';
            }//end switch
        }

        //EventHandlers
        private onNotify(sender: any, e: NotifictionEventArgs) {
            var notification: INotification = {
                type: this.getType(e.ntype),
                title: e.title,
                timeout: e.timeout,
                toastId: e.id,
                showCloseButton: e.showClose,
                body: e.msg
            };

            this.Notify(notification);
        }
        private onClearNotify(sender: any, e: NotifictionEventArgs) {
            this.clearToasts(e.id);
        }

    }//end class
    class NotificationServiceProvider implements ng.IServiceProvider {
        
        constructor() {
            this.$get.$inject = ['toaster', 'WiM.Event.EventManager'];   
            console.log("notificationservicProvider new")                     
        }

        public $get(toaster:any,eventManager:WiM.Event.IEventManager){
            return new NotificationService(toaster,eventManager);
        }
    }
    export enum NotificationType {
        e_error = -1,        
        e_info = 0,
        e_wait = 1,
        e_success =2,
        e_warning = 3,        
    }


    factory.$inject = ['toaster', 'WiM.Event.EventManager'];
    function factory(toaster: any, eventManager: WiM.Event.IEventManager) {
        return new NotificationService(toaster, eventManager);
    }
    angular.module('StreamEst.Services')
        .service('StreamEst.Services.NotificationService', factory)
        
}//end module  