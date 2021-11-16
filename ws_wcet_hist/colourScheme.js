// Defines the colour scheme for hdlvis
//
// TODO: there are many nicer ways to do this....
//
// author: stf

class colourScheme {

    constructor(scheme) {
        switch(scheme) {
            case "dark":
                this.env = "black";
                this.base = "#39ff14";
                this.highlight = "#E95420";
                break;

            case "light":
                this.env = "white";
                this.base = "black";
                this.highlight = "#E95420";
                break;
        }
    }


}
