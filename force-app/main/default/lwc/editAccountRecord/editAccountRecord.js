import { LightningElement, api, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { getLocationService } from "lightning/mobileCapabilities";

import NAME_FIELD from "@salesforce/schema/Account.Name";
import PHONE_FIELD from "@salesforce/schema/Account.Phone";
import WEBSITE_FIELD from "@salesforce/schema/Account.Website";
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";
import TYPE_FIELD from "@salesforce/schema/Account.Type";

import LOCATION_FIELD from "@salesforce/schema/Account.Location__c";

export default class EditAccountRecord extends LightningElement {
  @api recordId;
  @api objectApiName;

  @track currentLocation;

  nameField = NAME_FIELD;
  phoneField = PHONE_FIELD;
  websiteField = WEBSITE_FIELD;
  industryField = INDUSTRY_FIELD;
  typeField = TYPE_FIELD;
  locationField = LOCATION_FIELD;
  locationService;

  @wire(getRecord, { recordId: "$recordId", fields: [NAME_FIELD] })
  record;

  get name() {
    return this.record &&
      this.record.data &&
      this.record.data.fields &&
      this.record.data.fields.Name
      ? this.record.data.fields.Name.value
      : "";
  }

  onSuccess(event) {
    console.log("Updated account", event.detail);
    // Dismiss modal on success
    this.dismiss(event);
  }

  dismiss(event) {
    console.log("Dismissing modal", event.detail);
    // TODO: Can we use window.history.back() here?
    // eslint-disable-next-line no-restricted-globals
    history.back();
  }

  // When the component is initialized, detect whether to enable the button
  connectedCallback() {
    this.locationService = getLocationService();
  }

  handleGetCurrentLocationClick() {
    if (this.locationService != null && this.locationService.isAvailable()) {
      this.errorMessage = null;

      // Configure options for location request
      const locationOptions = {
        enableHighAccuracy: true,
      };

      // Make the request to get the location
      this.locationService
        .getCurrentPosition(locationOptions)
        .then((result) => {
          this.currentLocation = result.coords;
        })
        .catch((error) => {
          switch (error.code) {
            case "LOCATION_SERVICE_DISABLED":
              this.errorMessage = "Location service on the device is disabled."; // Android only
              break;
            case "USER_DENIED_PERMISSION":
              this.errorMessage =
                "User denied permission to use location service on the device.";
              break;
            case "USER_DISABLED_PERMISSION":
              this.errorMessage =
                "Toggle permission to use location service on the device from Settings.";
              break;
            case "SERVICE_NOT_ENABLED":
              this.errorMessage =
                "Location service on the device is not enabled.";
              break;
            case "UNKNOWN_REASON":
            default:
              this.errorMessage = error.message;
              break;
          }
        });
    } else {
      this.errorMessage = "Nimbus location service is not available.";
    }
  }
}
