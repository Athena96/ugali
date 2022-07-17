import { Theme } from "@aws-amplify/ui-react";
import { salmonRed } from "./utilities/constants";

const theme: Theme = {
  name: "cra-my-theme",
  
  tokens: {
    
    colors: {

      
      border: {

        primary: {
          value: salmonRed
        },
        secondary: {
          value: salmonRed
        },
      },
      font: {

        active: {
          value: salmonRed

        },

        primary: {
          value: salmonRed
        },
        secondary: {
          value: salmonRed
        }
      },
      // brand: {
      //   primary: {
      //     '10': salmonRed,
      //     '80': salmonRed,
      //     '90': salmonRed,
      //     '100': salmonRed
      //   },
      // },
    },
    components: {

      button: {
        // this will affect the font weight of all button variants
        fontWeight: { value: salmonRed },
        // style the primary variation
        primary: {
          backgroundColor: { value: salmonRed },
          _hover: {
            backgroundColor: { value: salmonRed },
          },
        },
      },


tabs: {
  item: {
    _focus: {
      color: {
        value: salmonRed
      },
    },
    _hover: {
      color: {
        value: 'grey'
      },
    },
    _active: {
      color: {
        value: salmonRed
      },
    },
    _inactive: {
      color: {
        value: salmonRed
      },
    },
    _disabled: {
      color: {
        value: salmonRed
      },
    },
  },
},
    }
  }

};

export default theme;
