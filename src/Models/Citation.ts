//------------------------------------------------------------------------------
//----- Citation ---------------------------------------------------------------
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
    export interface ICitation {
        title: string;
        author: string;
        imgSrc: string;
        src: string;
    }
    export class Citation implements ICitation {
        //Properties
        title: string;
        author: string;
        imgSrc: string;
        src: string;

        // Constructor
        constructor(title: string, author: string, imageSrc: string, url: string) {
            this.title = title;
            this.author = author;
            this.imgSrc = imageSrc;
            this.src = url;
        }//end constructor
    }//end class

}//end module  