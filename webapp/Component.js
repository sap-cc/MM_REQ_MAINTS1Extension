jQuery.sap.declare("ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.Component");

// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "ui.s2p.mm.requisition.maintain.s1",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/MM_REQ_MAINTS1"
		// we use a URL relative to our own component
		// extension application is deployed with customer namespace
});

this.ui.s2p.mm.requisition.maintain.s1.Component.extend("ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.Component", {
	metadata: {
		manifest: "json"
	},
	
	init: function e() {
		ui.s2p.mm.requisition.maintain.s1.Component.prototype.init.apply(this,arguments);
		this.getModel("i18n").enhance({
			bundleName:"ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.i18n.i18n"}
		);
		
	}
});