//------------------------------------------------------------------------------
//----- ReferenceGage ----------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Capture and hold users session information
//          
//discussion:
//

//Comments
//07.20.2016 jkn - Created


//Imports"
// Interface
module StreamEst.Models {
    export interface IReferenceGage {
        StationID: string;
        Name: string;
        DrainageArea_sqMI: number;
        Latitude_DD: number;
        Longitude_DD: number;
        URL: string;
        displayName: string;
    }
    export class ReferenceGage implements IReferenceGage {
        //Properties
        public StationID: string;
        public Name: string;
        public DrainageArea_sqMI: number;
        public Latitude_DD: number;
        public Longitude_DD: number;
        public URL: string;
        public displayName: string;
        public correlation: number;

        // Constructor
        constructor(id:string,name:string) {
            this.StationID = id;
            this.Name = name;
        }//end constructor 
    }//end class

}//end module  