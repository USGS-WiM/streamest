//------------------------------------------------------------------------------
//----- Parameter --------------------------------------------------------------
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
//07.18.2016 jkn - Created


//Imports"
// Interface
module StreamEst.Models {
    export interface IParameter extends WiM.Models.IParameter {
        description: string;
        limits: ILimit;
    }
    export interface ILimit{
        max: number;
        min: number;
    }
    export class Parameter implements IParameter {
        //Properties
        public name: string;
        public code: string;
        public unit: string;
        public value: number;
        public description: string;
        public limits: ILimit;

        // Constructor
        constructor(nm: string = "", c: string = "", desc: string = "", unit: string = "", val: number = NaN) {
            this.name = nm;
            this.code = c;
            this.description = desc;
            this.unit = unit;
            this.value = val;
           
        }//end constructor
    }//end class

}//end module   