sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"ui/s2p/mm/requisition/maintain/s1/model/formatter",
	"ui/s2p/mm/requisition/maintain/s1/misc/Validations",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"sap/ui/core/message/MessageManager",
	"sap/ui/core/message/Message",
	"sap/ui/core/Fragment",
	"sap/ui/core/routing/History"
], function (C, B, J, f, V, M, b, D, c, d, F, H) {
	"use strict";
	return sap.ui.controller("ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.controller.CartOverviewCustom", {
		//    formatter: f,
		//    Validations: V,
		//    onInit: function () {
		//        this.initializeUIPropertiesModel();
		//        this.initializeVariables();
		//        this.loadUserDefaultSettings();
		//        this.oRouter.getRoute("CartOverview").attachPatternMatched(this._handleRouteMatched, this);
		//    },
		
		
			/**
			 * Order cart
			 * @public
			 */
			handleOrderCartPress: function (oEvent) {
				var oI18n = this.getView().getModel("i18n").getResourceBundle();
				
				var oCartItems = this.oView.byId("productsTable").getItems();
				var sMessagetext = "<ul>";
				var sColor = "";
				
				var aPath = [];
				
				var sAccCatTemp = "INIT";
				var bCatOk = true;
				
				for (var i = 0; i < oCartItems.length; i++) {
					var sAccCat = oCartItems[i].getBindingContext().getProperty("AccountAssignmentCategory");
					if (sAccCatTemp === "INIT") {
						sAccCatTemp = sAccCat;
						this._sAccCat = sAccCatTemp;
					}
					if (sAccCatTemp !== sAccCat) {
						bCatOk = false;
						sColor = " style=\"color:red\">";
					} else {
						sColor = ">";
					}
					
					sMessagetext += "<li" + sColor + "Position " + (i+1) + ": '" + sAccCat + "'</li>";
					aPath.push(oCartItems[i].getBindingContext().getPath());
					
				}
				sMessagetext += "</ul>";
				
				if (bCatOk) {
					// Kontierungstypen sind identisch, Kontierungsobjekte vergleichen
					this._checkAccountAssignmentObjects(aPath);
					
				} else {
					// Kontierungstyp nicht identisch (Kontierungsobjekt steht noch nicht zur Verfuegung)
					var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
					b.error(oI18n.getText("messageText"), {
						title: oI18n.getText("error"),
						details: sMessagetext,
						contentWidth: "100px",
						styleClass: sResponsivePaddingClasses
					});
				}
			},
			
			/**
			 * Reading account assignment objects and check them
			 * @private
			 */
			_checkAccountAssignmentObjects: function(aPath) {
				var that = this;
				var aFunction = [];
				for (var i = 0; i < aPath.length; i++) {
					aFunction.push(this._readAccountAssignmentObject(aPath[i]));
				}
				
				Promise.all(aFunction).then(that._evaluateAccountAssignmentObjects.bind(that),
											that._handleDataError.bind(that));
			},
			
			/**
			 * Read account assignment objects in cart
			 * @private
			 */
			_readAccountAssignmentObject: function(sPath) {
				var that = this;
				return new Promise(
					function(resolve, reject) {
						var oModel = that.getAppModel();
						oModel.read(sPath + "/to_PurReqnAccAssignment_WD", {
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
					}
				);
			},
			
			/**
			 * Evaluate account assignment objects
			 * @private
			 */
			_evaluateAccountAssignmentObjects: function(oData) {
				var oI18n = this.getView().getModel("i18n").getResourceBundle();
				var sMessagetextObj = "<ul>";
				var sColor = "";

				var sAccObjTemp = "INIT";
				var bObjOk = true;
				for (var i = 0; i < oData.length; i++) {
					var sAccObj = "";
					switch (this._sAccCat) {
						case "A":
							sAccObj = oData[i].results[0].MasterFixedAsset;
							break;
						case "F":
							sAccObj = oData[i].results[0].OrderID;
							break;
						case "K":
							sAccObj = oData[i].results[0].CostCenter;
							break;
						case "Q":
							sAccObj = oData[i].results[0].WBSElement;
							break;
						// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
						case "P":
							sAccObj = oData[i].results[0].WBSElement;
							break;
					}
					if (sAccObjTemp === "INIT") {
						sAccObjTemp = sAccObj;
					}
					if (sAccObjTemp !== sAccObj) {
						bObjOk = false;
						sColor = " style=\"color:red\">";
					} else {
						sColor = ">";
					}
					sMessagetextObj += "<li" + sColor + "Position " + (i+1) + ": '" + this._sAccCat + "' - '" + sAccObj + "'</li>";
				
				}
				
				sMessagetextObj += "</ul>";
				
				if (bObjOk) {
					B.prototype.handleOrderCartPress.apply(this, arguments);
				} else {
					// Kontierungsobjekte nicht identisch
					var sResponsivePaddingClassesObj = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
					b.error(oI18n.getText("messageTextObj"), {
						title: oI18n.getText("error"),
						details: sMessagetextObj,
						contentWidth: "100px",
						styleClass: sResponsivePaddingClassesObj
					});
				}
			},
			
			/**
			 * Error handling (oData-Service)
			 * @private
			 */
			_handleDataError: function(oError) {
				var oI18n = this.getView().getModel("i18n").getResourceBundle();
				var sMessage = JSON.parse(oError.responseText).error.message.value;
				b.show(sMessage, {
					title: oI18n.getText("serverError"),
					icon: sap.m.MessageBox.Icon.ERROR
				});
			}
		
		
		//    initializeUIPropertiesModel: function () {
		//        var u = new J();
		//        var a = {
		//            reworkFacetVisible: false,
		//            limitItemsTableVisible: true
		//        };
		//        u.setData(a);
		//        this.getView().setModel(u, "viewProperties");
		//        this.oSourcePRApprovalDetailsJSONModel = new J();
		//    },
		//    initializeVariables: function () {
		//        this.oComponent = this.getOwnerComponent();
		//        this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		//        this.oModel = this.getAppModel();
		//        this.view = this.getView();
		//        this.oUIPropertiesModel = this.view.getModel("viewProperties");
		//        this.oResourceBundle = this.getResourceBundle();
		//        this.oCartTable = this.byId("productsTable");
		//        this.oLimitCartTable = this.byId("limitItemsTable");
		//        this.oMessageManager = sap.ui.getCore().getMessageManager();
		//        this.view.setModel(this.oMessageManager.getMessageModel(), "message");
		//        this.oMessageManager.registerMessageProcessor(this.oModel);
		//    },
		//    initializeMsgVariables: function () {
		//        var a;
		//        if (this.getTestMode()) {
		//            a = this.view._getBindingContext();
		//        } else {
		//            a = this.view.getBindingContext();
		//        }
		//        var p = a.getPath();
		//        this.noItemInDraftError = new d({
		//            message: this.oResourceBundle.getText("noItemInDraftError"),
		//            type: sap.ui.core.MessageType.Error,
		//            processor: this.oModel
		//        });
		//        this.expectedOverallLimitAmountError = new d({
		//            message: this.oResourceBundle.getText("expectedOverallLimitAmountError"),
		//            type: sap.ui.core.MessageType.Error,
		//            target: p + "/ExpectedOverallLimitAmount",
		//            processor: this.oModel
		//        });
		//        this.overallLimitAmountError = new d({
		//            message: this.oResourceBundle.getText("overallLimitAmountError"),
		//            type: sap.ui.core.MessageType.Error,
		//            target: p + "/OverallLimitAmount",
		//            processor: this.oModel
		//        });
		//    },
		//    loadUserDefaultSettings: function () {
		//        var p = this.getServiceCallParameter(this.loadUserDefaultSettingsSuccess, this.loadUserDefaultSettingsFailure);
		//        this.dataManager.loadUserDefaultSettings(p);
		//    },
		//    loadUserDefaultSettingsSuccess: function (o, r) {
		//        if (r.statusCode === "200") {
		//            this.setUserDefaultSettings(r.data.GetUserOrgDefault);
		//        }
		//    },
		//    loadUserDefaultSettingsFailure: function (e) {
		//    },
		//    _handleRouteMatched: function (e) {
		//        this.clearMessages();
		//        this.view.unbindElement();
		//        this.view.setBusyIndicatorDelay(0);
		//        this.setBusyIndicator(true);
		//        this.resetVariables();
		//        this.setKeys(e.getParameter("arguments"));
		//        this.handleCopyPRScenario();
		//        this.loadCartOverviewPageData();
		//    },
		//    resetVariables: function () {
		//        this.oUIPropertiesModel.setProperty("/reworkFacetVisible", false);
		//        this.oUIPropertiesModel.setProperty("/limitItemsTableVisible", true);
		//        this.oComponent.getComponentData().currentPRItems = [];
		//        this.currentPRNumber = "";
		//        this.sourcePRApprovalDataFetchComplete = false;
		//        this.normalItemsTableUpdateFinished = false;
		//        this.limitItemsTableUpdateFinished = false;
		//        if (this.oComponent.getComponentData().changingSourcePageAllowed) {
		//            this.setSourcePage("CartOverview");
		//        }
		//        this.view.byId("deleteItem").setEnabled(false);
		//        this.view.byId("copyItem").setEnabled(false);
		//        if (this.view.byId("deleteLimitItemBtn")) {
		//            this.view.byId("deleteLimitItemBtn").setEnabled(false);
		//        }
		//        if (this.view.byId("copyLimitItemBtn")) {
		//            this.view.byId("copyLimitItemBtn").setEnabled(false);
		//        }
		//        if (this.oWorkflowComponent) {
		//            this.oWorkflowComponent.destroy(true);
		//            this.oWorkflowComponent = null;
		//        }
		//    },
		//    setKeys: function (a) {
		//        this.setHeaderDraftKey(a.DraftKey);
		//        this.setPurchaseRequisition(a.PurchaseRequisition);
		//        this.currentPRNumber = this.getPurchaseRequisition();
		//    },
		//    handleCopyPRScenario: function () {
		//        if (this.getCopyScenarioFlag() && this.getCopyHeader()) {
		//            this.getCopyMessages();
		//            this.clearPurchaseRequisition();
		//            this.clearCopyHttpHeader();
		//            this.clearCopyHeader();
		//            sap.m.MessageToast.show(this.oResourceBundle.getText("CopyToCart"));
		//        }
		//    },
		//    getCopyMessages: function () {
		//        var m = sap.ui.getCore().getMessageManager();
		//        var h = this.getCopyHttpHeader();
		//        var a;
		//        var g = "";
		//        if (h["sap-message"]) {
		//            var o = new sap.ui.core.message.ControlMessageProcessor();
		//            a = new sap.ui.core.message.Message({
		//                message: JSON.parse(h["sap-message"]).message,
		//                type: sap.ui.core.MessageType.Information,
		//                id: "1",
		//                code: g,
		//                persistent: true,
		//                processor: o
		//            });
		//            m.addMessages(a);
		//            if (h["sap-message"].search("details")) {
		//                var j = JSON.parse(h["sap-message"]);
		//                for (var i = 0; i < j.details.length; i++) {
		//                    g = "";
		//                    try {
		//                        g = j.details[i].code;
		//                    } catch (e) {
		//                    }
		//                    a = new sap.ui.core.message.Message({
		//                        message: j.details[i].message,
		//                        type: sap.ui.core.MessageType.Information,
		//                        id: "1",
		//                        code: g,
		//                        persistent: true,
		//                        processor: o
		//                    });
		//                    m.addMessages(a);
		//                }
		//            }
		//        }
		//    },
		//    loadCartOverviewPageData: function () {
		//        this.oCartOverviewListItemFragment = null;
		//        this.oCartOverviewLimitListItemFragment = null;
		//        var t = this;
		//        F.load({
		//            name: "ui.s2p.mm.requisition.maintain.s1.fragment.CartOverviewListItem",
		//            controller: this
		//        }).then(function (o) {
		//            t.oCartOverviewListItemFragment = o;
		//            F.load({
		//                name: "ui.s2p.mm.requisition.maintain.s1.fragment.CartOverviewLimitListItem",
		//                controller: t
		//            }).then(function (a) {
		//                t.oCartOverviewLimitListItemFragment = a;
		//                var p = t.getServiceCallParameter(t.loadCartOverviewPageDataSuccess, t.loadCartOverviewPageDataFailure);
		//                t.dataManager.loadCartOverviewPageData(p, t.getHeaderDraftKey(), t.getPurchaseRequisition(), t.oCartTable, t.oLimitCartTable, t.oCartOverviewListItemFragment, t.oCartOverviewLimitListItemFragment);
		//            });
		//        });
		//    },
		//    loadCartOverviewPageDataSuccess: function (o, r) {
		//        if (o.__batchResponses[0] && o.__batchResponses[0].response && o.__batchResponses[0].response.statusCode === "404") {
		//            this.navigateToMainPage();
		//        } else {
		//            var u = "/C_Sspprmaint_Hdr(PurchaseRequisition='" + this.getPurchaseRequisition() + "',DraftUUID=guid'" + this.getHeaderDraftKey() + "',IsActiveEntity=false)";
		//            this.view.bindElement(u);
		//            var a = new sap.ui.model.Context(this.oModel, this.view.getElementBinding().getPath());
		//            this.view.setBindingContext(a);
		//            this.initializeMsgVariables();
		//            var h;
		//            if (o.__batchResponses) {
		//                if (o.__batchResponses[0] && o.__batchResponses[0].data) {
		//                    h = o.__batchResponses[0].data;
		//                    this.setUIFields(h);
		//                    if (h.PurchaseRequisition !== "" && h.NumberOfItems === 0) {
		//                        this.oMessageManager.addMessages(this.noItemInDraftError);
		//                    }
		//                }
		//                if (o.__batchResponses[1] && o.__batchResponses[1].data) {
		//                    var s = o.__batchResponses[1].data;
		//                    this.setRequestorFields(s);
		//                }
		//                if (o.__batchResponses[2] && o.__batchResponses[2].data) {
		//                    this.oSourcePRApprovalDetailsJSONModel.setData(o.__batchResponses[2].data);
		//                }
		//            }
		//            if (h) {
		//                this.loadWorkflowComponent(h);
		//            }
		//            this.sourcePRApprovalDataFetchComplete = true;
		//            this.updateScreenWithSourcePRDetails();
		//        }
		//    },
		//    loadCartOverviewPageDataFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    navigateToMainPage: function () {
		//        if (this.oComponent.getComponentData().startupParameters.mode !== undefined) {
		//            if (this.oComponent.getComponentData().startupParameters.mode[0] === "create") {
		//                this.oRouter.navTo("Search");
		//            }
		//        } else {
		//            this.getRouter().navTo("PurReqList", {}, {}, true);
		//        }
		//    },
		//    setUIFields: function (h) {
		//        if (this.currentPRNumber !== "") {
		//            if (h.PurReqnLifeCycleStatus === "G") {
		//                this.view.byId("btnReturn").setEnabled(true);
		//            } else {
		//                this.view.byId("btnReturn").setEnabled(false);
		//            }
		//            if (h.PurReqnLifeCycleStatus === "C") {
		//                this.view.byId("btnConfirm").setEnabled(true);
		//            } else {
		//                this.view.byId("btnConfirm").setEnabled(false);
		//            }
		//        }
		//        if (h.PurReqnIsApplicableForRework) {
		//            this.oUIPropertiesModel.setProperty("/reworkFacetVisible", true);
		//        } else {
		//            this.oUIPropertiesModel.setProperty("/reworkFacetVisible", false);
		//        }
		//        if (h.IsExtPurgScenario) {
		//            this.oUIPropertiesModel.setProperty("/limitItemsTableVisible", false);
		//        } else {
		//            this.oUIPropertiesModel.setProperty("/limitItemsTableVisible", true);
		//        }
		//    },
		//    setRequestorFields: function (s) {
		//        this.sobType = "";
		//        var a;
		//        if (this.getTestMode()) {
		//            a = this.view._getBindingContext();
		//        } else {
		//            a = this.view.getBindingContext();
		//            this.sobType = s.ShopOnBehalfType;
		//        }
		//        var p = a.getPath();
		//        var r = a.getProperty("PurReqnSSPRequestor");
		//        if (this.sobType === "" && !this.getPurchaseRequisition()) {
		//            this.oModel.setProperty(p + "/PurReqnEmplByCoOfAuthor", r);
		//            this.view.byId("PRRequestorByGrpName").setVisible(false);
		//            this.view.byId("PRRequestorByCoName").setVisible(true);
		//        } else {
		//            this.oModel.setProperty(p + "/PurReqnEmplByReqnGrpOfAuthor", r);
		//            this.view.byId("PRRequestorByCoName").setVisible(false);
		//            this.view.byId("PRRequestorByGrpName").setVisible(true);
		//        }
		//    },
		//    loadWorkflowComponent: function (h) {
		//        var w = this.getWorkFlowDetails(h, "CartOverview");
		//        var p = this.getServiceCallParameter(this.getWorkFlowDetailsSuccess, this.getWorkFlowDetailsFailure);
		//        this.dataManager.getWorkFlowDetails(p, w);
		//    },
		//    getWorkFlowDetailsSuccess: function (a) {
		//        this.setIsPurReqOverallRelease(a.IsPurReqOverallRelease);
		//        var p = this.getView().byId("idReuseWorkFlowGridCart");
		//        if (a.IsPurReqOverallRelease) {
		//            var e = this.getView().byId("workflowCompContainerCartID");
		//            p.setVisible(true);
		//            p.setBusy(true);
		//            this.showWorkflowComponent(a.WrkFlwScenID, this.getPurchaseRequisition(), "", e, this.getHeaderDraftKey(), p);
		//        } else {
		//            p.setVisible(false);
		//        }
		//    },
		//    getWorkFlowDetailsFailure: function () {
		//    },
		//    onPRReqChanged: function () {
		//        this.setBusyIndicator(true);
		//        this.clearMessages();
		//        var p = this.prepareHeaderPayload();
		//        var P = this.getServiceCallParameter(this.onPRReqChangedSuccess, this.onPRReqChangedFailure);
		//        if (this.getExtScenarioFlag()) {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable);
		//        } else {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable, this.oLimitCartTable);
		//        }
		//    },
		//    prepareHeaderPayload: function () {
		//        var r = this.view.getBindingContext().getProperty("PurReqnEmplByReqnGrpOfAuthor");
		//        var a = this.view.getBindingContext().getProperty("PurReqnEmplByCoOfAuthor");
		//        var p;
		//        if (this.getTestMode()) {
		//            p = this.view.getBindingContext().getObject();
		//        } else {
		//            p = this.view.getBindingContext().getObject({ select: "*" });
		//        }
		//        if (r) {
		//            p.PurReqnSSPRequestor = r;
		//        } else {
		//            p.PurReqnSSPRequestor = a;
		//        }
		//        delete p.PurReqnEmplByCoOfAuthor;
		//        delete p.PurReqnEmplByReqnGrpOfAuthor;
		//        return p;
		//    },
		//    onPRReqChangedSuccess: function () {
		//        sap.m.MessageBox.show(this.oResourceBundle.getText("requestorChange"), {
		//            icon: sap.m.MessageBox.Icon.INFORMATION,
		//            title: this.oResourceBundle.getText("titleInformation"),
		//            actions: [sap.m.MessageBox.Action.OK],
		//            onClose: function (a) {
		//            }
		//        });
		//    },
		//    onPRReqChangedFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    onPRNameChanged: function () {
		//        this.setBusyIndicator(true);
		//        this.clearMessages();
		//        var p = this.prepareHeaderPayload();
		//        var P = this.getServiceCallParameter(this.onPRNameChangedSuccess, this.onPRNameChangedFailure);
		//        if (this.getExtScenarioFlag()) {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable);
		//        } else {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable, this.oLimitCartTable);
		//        }
		//    },
		//    onPRNameChangedSuccess: function () {
		//        sap.m.MessageToast.show(this.oResourceBundle.getText("updatePRDesc"));
		//    },
		//    onPRNameChangedFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    onRequestorCommentsChange: function (e) {
		//        this.setBusyIndicator(true);
		//        this.clearMessages();
		//        var p = this.prepareHeaderPayload();
		//        var P = this.getServiceCallParameter(this.onRequestorCommentsChangeSuccess, this.onRequestorCommentsChangeFailure);
		//        if (this.getExtScenarioFlag()) {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable);
		//        } else {
		//            this.dataManager.updateAndReloadCartData(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), p, "", this.oCartTable, this.oLimitCartTable);
		//        }
		//    },
		//    onRequestorCommentsChangeSuccess: function () {
		//        sap.m.MessageToast.show(this.oResourceBundle.getText("requestorCommentsUpdatedMsg"));
		//    },
		//    onRequestorCommentsChangeFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    viewHeaderStatusDetails: function (e) {
		//        this.headerStatusButton = e.getSource();
		//        var t = this;
		//        if (this.rejStatusDialog) {
		//            this.rejStatusDialog.destroy();
		//            this.rejStatusDialog = null;
		//        }
		//        F.load({
		//            name: "ui.s2p.mm.requisition.maintain.s1.fragment.RejectedStatus",
		//            controller: this
		//        }).then(function (o) {
		//            t.rejStatusDialog = o;
		//            t.getView().addDependent(t.rejStatusDialog);
		//            t.rejStatusDialog.setModel(t.oSourcePRApprovalDetailsJSONModel);
		//            t.rejStatusDialog.bindElement("/results/0");
		//            t.rejStatusDialog.openBy(t.headerStatusButton);
		//        });
		//    },
		//    onCartTableUpdateFinished: function () {
		//        var i = this.oCartTable.getItems();
		//        var t = this.byId("smartProductsTable").getToolbar().getContent();
		//        if (t) {
		//            var e = t[t.length - 1];
		//        }
		//        this.view.byId("itemsTableTitle").setText(this.oResourceBundle.getText("prItemsTableHeader", [this.oCartTable.getBinding("items").getLength()]));
		//        if (i[0]) {
		//            var a = i[0].getBindingContext();
		//            this.setConnectedSystem(a.getProperty("ProcurementHubSourceSystem"));
		//            this.highlightListItems(i);
		//            if (e) {
		//                e.setEnabled(true);
		//            }
		//        } else {
		//            if (e) {
		//                e.setEnabled(false);
		//            }
		//        }
		//        this.normalItemsTableUpdateFinished = true;
		//        this.updateScreenWithSourcePRDetails();
		//        this.setButtons();
		//        if (this.getIsPurReqOverallRelease() && this.oWorkflowComponent) {
		//            this.oWorkflowComponent.refresh();
		//        }
		//    },
		//    setButtons: function () {
		//        var n, l;
		//        if (this.getExtScenarioFlag()) {
		//            if (this.normalItemsTableUpdateFinished) {
		//                n = this.oCartTable.getItems().length;
		//                this.view.byId("btnCart").setType(n > 0 ? "Emphasized" : "Default");
		//            }
		//        } else if (this.limitItemsTableUpdateFinished && this.normalItemsTableUpdateFinished) {
		//            n = this.oCartTable.getItems().length;
		//            l = this.oLimitCartTable.getItems().length;
		//            var t = n + l;
		//            this.view.byId("btnCart").setType(t > 0 ? "Emphasized" : "Default");
		//        }
		//        if (!this.getTestMode()) {
		//            if (this.getIsUsrExpertMode() && !this.getPurchaseRequisition()) {
		//                this.view.byId("btnExpertCheckOut").setVisible(true);
		//            } else {
		//                this.view.byId("btnExpertCheckOut").setVisible(false);
		//            }
		//        }
		//    },
		//    updateScreenWithSourcePRDetails: function () {
		//        var s;
		//        if (this.getExtScenarioFlag()) {
		//            if (this.sourcePRApprovalDataFetchComplete && this.normalItemsTableUpdateFinished) {
		//                s = this.oSourcePRApprovalDetailsJSONModel.getData();
		//                if (s && s.results && s.results[0]) {
		//                    if (s.results[0].HeaderStatus) {
		//                        this.view.byId("headerStatus").setVisible(true);
		//                    } else {
		//                        this.view.byId("headerStatus").setVisible(false);
		//                        this._updateLineItems("NORMAL_ITEMS_TABLE", s.results);
		//                    }
		//                }
		//                this.setBusyIndicator(false);
		//            }
		//        } else {
		//            if (this.sourcePRApprovalDataFetchComplete && this.normalItemsTableUpdateFinished && this.limitItemsTableUpdateFinished) {
		//                s = this.oSourcePRApprovalDetailsJSONModel.getData();
		//                if (s && s.results && s.results[0]) {
		//                    if (s.results[0].HeaderStatus) {
		//                        this.view.byId("headerStatus").setVisible(true);
		//                    } else {
		//                        this.view.byId("headerStatus").setVisible(false);
		//                        this._updateLineItems("NORMAL_ITEMS_TABLE", s.results);
		//                        this._updateLineItems("LIMIT_ITEMS_TABLE", s.results);
		//                    }
		//                }
		//                this.setBusyIndicator(false);
		//            }
		//        }
		//    },
		//    _updateLineItems: function (t, a) {
		//        var e = [];
		//        if (t === "NORMAL_ITEMS_TABLE") {
		//            e = this.oCartTable.getItems();
		//        } else if (t === "LIMIT_ITEMS_TABLE") {
		//            e = this.oLimitCartTable.getItems();
		//        }
		//        for (var i = 0; i < a.length; i++) {
		//            for (var j = 0; j < e.length; j++) {
		//                if (e[j].getBindingContext().getProperty("SourcePurchaseRequisitionItem") === a[i].SourcePurchaseRequisitionItem) {
		//                    if (t === "NORMAL_ITEMS_TABLE") {
		//                        e[j].getAggregation("cells")[1].getAggregation("items")[5].setVisible(true);
		//                    } else if (t === "LIMIT_ITEMS_TABLE") {
		//                        e[j].getAggregation("cells")[0].getAggregation("items")[4].setVisible(true);
		//                    }
		//                }
		//            }
		//        }
		//    },
		//    onQuantityChanged: function (e) {
		//        var q = e.getSource();
		//        if (e.getSource().getValueState() !== "Error") {
		//            var i = q.getBindingContext().getObject({ select: "*" });
		//            this.clearMessages();
		//            this._updateLineItem(i);
		//        }
		//    },
		//    onCartLimitItemsTableUpdateFinished: function () {
		//        var i = this.oLimitCartTable.getItems();
		//        var t = this.byId("limitItemsSmartTable").getToolbar().getContent();
		//        if (t) {
		//            var e = t[t.length - 1];
		//        }
		//        this.view.byId("limitItemsTableTitle").setText(this.oResourceBundle.getText("prItemsTableHeader", [this.oLimitCartTable.getBinding("items").getLength()]));
		//        if (i && i[0]) {
		//            var a = i[0].getBindingContext();
		//            this.setConnectedSystem(a.getProperty("ProcurementHubSourceSystem"));
		//            this.highlightListItems(i);
		//            if (e) {
		//                e.setEnabled(true);
		//            }
		//            this.setLimitItemExists(true);
		//        } else {
		//            if (e) {
		//                e.setEnabled(false);
		//            }
		//            this.setLimitItemExists(false);
		//        }
		//        this.limitItemsTableUpdateFinished = true;
		//        this.updateScreenWithSourcePRDetails();
		//        this.setButtons();
		//        if (this.getIsPurReqOverallRelease() && this.oWorkflowComponent) {
		//            this.oWorkflowComponent.refresh();
		//        }
		//    },
		//    setBusyIndicator: function (a) {
		//        if (a) {
		//            this.view.setBusy(true);
		//        } else {
		//            if (this.sourcePRApprovalDataFetchComplete && this.getExtScenarioFlag()) {
		//                this.view.setBusy(false);
		//                this.normalItemsTableUpdateFinished = false;
		//            } else if (this.sourcePRApprovalDataFetchComplete && this.limitItemsTableUpdateFinished && this.normalItemsTableUpdateFinished) {
		//                this.view.setBusy(false);
		//                this.normalItemsTableUpdateFinished = false;
		//                this.limitItemsTableUpdateFinished = false;
		//            }
		//        }
		//    },
		//    onOverallLimitAmountChange: function (e) {
		//        var o = e.getSource();
		//        o.setValueState("None");
		//        this.oMessageManager.removeMessages(this.overallLimitAmountError);
		//        var a = o.getBinding("value");
		//        var v = o.getValue();
		//        try {
		//            v = a.getType().parseValue(v, "string");
		//            a.getType().validateValue(v);
		//        } catch (g) {
		//            o.setValueState("Error");
		//            o.setValueStateText(g.message);
		//            return;
		//        }
		//        var i = o.getBindingContext().getObject({ select: "*" });
		//        this.clearMessages();
		//        this._updateLineItem(i);
		//    },
		//    onExpectedOverallLimitAmountChange: function (e) {
		//        var E = e.getSource();
		//        E.setValueState("None");
		//        this.oMessageManager.removeMessages(this.expectedOverallLimitAmountError);
		//        var o = E.getBinding("value");
		//        var v = E.getValue();
		//        try {
		//            v = o.getType().parseValue(v, "string");
		//            o.getType().validateValue(v);
		//        } catch (a) {
		//            E.setValueState("Error");
		//            E.setValueStateText(a.message);
		//            return;
		//        }
		//        var i = E.getBindingContext().getObject({ select: "*" });
		//        this.clearMessages();
		//        this._updateLineItem(i);
		//    },
		//    _updateLineItem: function (i) {
		//        this.setBusyIndicator(true);
		//        delete i.HasActiveEntity;
		//        delete i.HasDraftEntity;
		//        delete i.ParentDraftUUID;
		//        i = this.adjustPayload(i);
		//        var p = this.getServiceCallParameter(this.updateLineItemSuccess, this.serviceFail);
		//        if (this.getExtScenarioFlag()) {
		//            this.dataManager.updateAndReloadCartData(p, this.getHeaderDraftKey(), this.getPurchaseRequisition(), "", i, this.oCartTable);
		//        } else {
		//            this.dataManager.updateAndReloadCartData(p, this.getHeaderDraftKey(), this.getPurchaseRequisition(), "", i, this.oCartTable, this.oLimitCartTable);
		//        }
		//    },
		//    updateLineItemSuccess: function () {
		//        var m = "";
		//        var a = this.oMessageManager.getMessageModel().getData();
		//        for (var i = 0; i < a.length; i++) {
		//            if (a[i].message && a[i].code === "MMPUR_REQ_COMMON/022") {
		//                m = a[i].message;
		//                break;
		//            }
		//        }
		//        if (m) {
		//            sap.m.MessageToast.show(this.oResourceBundle.getText(m));
		//        } else {
		//            sap.m.MessageToast.show(this.oResourceBundle.getText("update"));
		//        }
		//        if (this.getIsPurReqOverallRelease() && this.oWorkflowComponent) {
		//            this.oWorkflowComponent.refresh();
		//        }
		//    },
		//    adjustPayload: function (o) {
		//        for (var p in o) {
		//            if (p.search("_fc") < 0) {
		//                var a = p.toString() + "_fc";
		//                if (o[a] === 1 || o[a] === 0) {
		//                    delete o[p];
		//                    delete o[a];
		//                }
		//            }
		//        }
		//        return o;
		//    },
		//    _createColumnConfig: function () {
		//        var a = [];
		//        a.push({
		//            label: this.oResourceBundle.getText("description"),
		//            property: "PurchaseRequisitionItemText",
		//            type: "string"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("overviewSupplierName"),
		//            type: "string",
		//            property: "SupplierName"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("miniSupplier"),
		//            type: "string",
		//            property: [
		//                "FixedSupplier",
		//                "Supplier",
		//                "ExtFixedSupplierForPurg",
		//                "ExtDesiredSupplierForPurg"
		//            ],
		//            template: "{0}{1}{2}{3}"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("miniDelDate"),
		//            type: "Date",
		//            property: "DeliveryDate"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("validityStartDate"),
		//            type: "Date",
		//            property: "PerformancePeriodStartDate"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("validityEndDate"),
		//            type: "Date",
		//            property: "PerformancePeriodEndDate"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("overviewQuantity"),
		//            property: [
		//                "RequestedQuantity",
		//                "BaseUnit"
		//            ],
		//            template: "{0} {1}"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("overviewUnitPrice"),
		//            property: [
		//                "PurchaseRequisitionPrice",
		//                "Currency",
		//                "NetPriceQuantity",
		//                "BaseUnit"
		//            ],
		//            template: "{0} {1} " + this.oResourceBundle.getText("CurrencyPer") + " {2} {3}"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("overviewSubTotal"),
		//            property: [
		//                "TotalNetAmount",
		//                "Currency"
		//            ],
		//            template: "{0} {1}"
		//        });
		//        a.push({
		//            label: this.oResourceBundle.getText("reworkRequired"),
		//            type: "Boolean",
		//            property: "PurReqnIsApplicableForRework"
		//        });
		//        return a;
		//    },
		//    _createListItemColumnConfig: function () {
		//        var l = [];
		//        l.push({
		//            label: this.oResourceBundle.getText("description"),
		//            property: "PurchaseRequisitionItemText",
		//            type: "string"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("overviewSupplierName"),
		//            type: "string",
		//            property: "SupplierName"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("miniSupplier"),
		//            type: "string",
		//            property: [
		//                "FixedSupplier",
		//                "Supplier",
		//                "ExtFixedSupplierForPurg",
		//                "ExtDesiredSupplierForPurg"
		//            ],
		//            template: "{0}{1}{2}{3}"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("validityStartDate"),
		//            type: "Date",
		//            property: "PerformancePeriodStartDate"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("validityEndDate"),
		//            type: "Date",
		//            property: "PerformancePeriodEndDate"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("expectedOverallLimit"),
		//            property: [
		//                "ExpectedOverallLimitAmount",
		//                "Currency"
		//            ],
		//            template: "{0} {1}"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("overallLimit"),
		//            property: [
		//                "OverallLimitAmount",
		//                "Currency"
		//            ],
		//            template: "{0} {1}"
		//        });
		//        l.push({
		//            label: this.oResourceBundle.getText("reworkRequired"),
		//            type: "Boolean",
		//            property: "PurReqnIsApplicableForRework"
		//        });
		//        return l;
		//    },
		//    onBeforeItemsExcelExport: function (e) {
		//        e.getParameter("exportSettings").workbook.columns.pop();
		//        e.getParameter("exportSettings").workbook.columns = this._createColumnConfig();
		//    },
		//    onBeforeLimitItemsExcelExport: function (e) {
		//        e.getParameter("exportSettings").workbook.columns.pop();
		//        e.getParameter("exportSettings").workbook.columns = this._createListItemColumnConfig();
		//    },
		//    onCartTableLineItemPressed: function (e) {
		//        this.getView().getModel().resetChanges();
		//        var a = "";
		//        a = e.getSource().getBindingContext();
		//        if (this.getTestMode()) {
		//            a = e.getSource()._getBindingContext();
		//        }
		//        this._onPRLineItemPressed("CartOverview", a);
		//    },
		//    copyPRItems: function () {
		//        this.setBusyIndicator(true);
		//        this.clearMessages();
		//        this._copyItems(this.view.byId("productsTable").getSelectedItems());
		//    },
		//    _copyItems: function (s) {
		//        var a = [];
		//        for (var i = 0; i < s.length; i++) {
		//            var e = s[i].getBindingContext().getProperty("DraftUUID");
		//            e = e.split("-").join("");
		//            a.push(e);
		//        }
		//        if (a.length > 0) {
		//            var g = JSON.stringify(a);
		//            var p = this.getServiceCallParameter(this.copyItemsSuccess, this.copyItemsFailure);
		//            this.dataManager.copyItems(p, g);
		//        } else {
		//            this.setBusyIndicator(false);
		//        }
		//    },
		//    copyItemsSuccess: function () {
		//        this.view.byId("deleteItem").setEnabled(false);
		//        this.view.byId("copyItem").setEnabled(false);
		//        this.view.byId("productsTable").removeSelections();
		//        this.view.byId("deleteLimitItemBtn").setEnabled(false);
		//        this.view.byId("copyLimitItemBtn").setEnabled(false);
		//        this.view.byId("limitItemsTable").removeSelections();
		//        sap.m.MessageToast.show(this.oResourceBundle.getText("CopyItems"));
		//        var p = this.getServiceCallParameter(this.loadDataSuccess, this.serviceFail);
		//        if (this.getExtScenarioFlag()) {
		//            this.dataManager.refreshCartOverviewPageData(p, this.oCartTable);
		//        } else {
		//            this.dataManager.refreshCartOverviewPageData(p, this.oCartTable, this.oLimitCartTable);
		//        }
		//    },
		//    loadDataSuccess: function () {
		//    },
		//    copyItemsFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    copyPRLimitItems: function () {
		//        this.setBusyIndicator(true);
		//        this.clearMessages();
		//        this._copyItems(this.view.byId("limitItemsTable").getSelectedItems());
		//    },
		//    onItemsSelectionChange: function (e) {
		//        if (e.getSource().getSelectedItems().length > 0) {
		//            this.view.byId("deleteItem").setEnabled(true);
		//            this.view.byId("copyItem").setEnabled(true);
		//        } else {
		//            this.view.byId("deleteItem").setEnabled(false);
		//            this.view.byId("copyItem").setEnabled(false);
		//        }
		//    },
		//    onLimitItemsSelectionChange: function (e) {
		//        if (e.getSource().getSelectedItems().length > 0) {
		//            this.view.byId("deleteLimitItemBtn").setEnabled(true);
		//            this.view.byId("copyLimitItemBtn").setEnabled(true);
		//        } else {
		//            this.view.byId("deleteLimitItemBtn").setEnabled(false);
		//            this.view.byId("copyLimitItemBtn").setEnabled(false);
		//        }
		//    },
		//    deletePRItems: function () {
		//        this.setBusyIndicator(true);
		//        var s = this.view.byId("productsTable").getSelectedItems();
		//        var o = this.getDeletableItemsAndDelIndicator(s);
		//        if (o.deletionPossible) {
		//            this.deleteAllDeletableItems(o.itemsForDeletion);
		//        } else {
		//            if (s.length === 1) {
		//                this.showItemDeletionErrorMessage(s[0]);
		//            } else {
		//                this.deleteOnlyDeletableItems(o.itemsForDeletion);
		//            }
		//        }
		//    },
		//    getDeletableItemsAndDelIndicator: function (s) {
		//        var a = true;
		//        var e = [];
		//        for (var i = 0; i < s.length; i++) {
		//            var g = s[i].getBindingContext().getObject({ select: "*" });
		//            if (this.getTestMode()) {
		//                g = s[i].getBindingContext().getObject();
		//            }
		//            var h = g.ProcurementHubSourceSystem;
		//            var j = this.getLifeCycleStatus(g.PurchaseRequisitionItem);
		//            if (j === "B" || j === "K" || j === "A" || j === "L" || j === "S" || j === "R" || j === "G" || j === "C" || j === "P" || (j === "02" || j === "05") && h || j === "EI") {
		//                a = false;
		//                continue;
		//            } else {
		//                var k = g.DraftUUID;
		//                k = k.split("-").join("");
		//                e.push(k);
		//            }
		//        }
		//        var o = {
		//            deletionPossible: a,
		//            itemsForDeletion: e
		//        };
		//        return o;
		//    },
		//    deleteAllDeletableItems: function (i) {
		//        var a = this.view.getBindingContext().getProperty("NumberOfItems");
		//        var t = this;
		//        if (a === i.length && this.getPurchaseRequisition() === "") {
		//            sap.m.MessageBox.show(this.oResourceBundle.getText("msgDeleteLastItemCart"), {
		//                icon: sap.m.MessageBox.Icon.WARNING,
		//                title: t.oResourceBundle.getText("msgBoxTitle"),
		//                actions: [
		//                    sap.m.MessageBox.Action.OK,
		//                    sap.m.MessageBox.Action.CANCEL
		//                ],
		//                styleClass: "sapUiSizeCompact",
		//                onClose: function (A) {
		//                    if (A === sap.m.MessageBox.Action.OK) {
		//                        t.deleteItems(i);
		//                    } else {
		//                        t.view.setBusy(false);
		//                    }
		//                },
		//                initialFocus: sap.m.MessageBox.Action.OK
		//            });
		//            return;
		//        } else {
		//            this.deleteItems(i);
		//        }
		//    },
		//    showItemDeletionErrorMessage: function (s) {
		//        var m;
		//        var a = s.getBindingContext().getObject({ select: "*" });
		//        if (this.getTestMode()) {
		//            a = s.getBindingContext().getObject();
		//        }
		//        var e = a.ProcurementHubSourceSystem;
		//        var i = this.getLifeCycleStatus(a.PurchaseRequisitionItem);
		//        if (i === "B" || i === "K" || i === "A" || i === "L" || i === "S" || i === "R" || i === "G" || i === "C" || i === "P") {
		//            m = this.oResourceBundle.getText("deleteFailed");
		//        } else if (i === "EI") {
		//            m = this.oResourceBundle.getText("deleteFailedExtInProc");
		//        } else if ((i === "02" || i === "05") && e) {
		//            m = this.oResourceBundle.getText("deleteFailedHubApproved");
		//        } else {
		//            m = this.oResourceBundle.getText("deleteFailedGen");
		//        }
		//        b.show(m, {
		//            icon: b.Icon.INFORMATION,
		//            title: this.oResourceBundle.getText("overviewDelete"),
		//            actions: [sap.m.MessageBox.Action.OK],
		//            initialFocus: sap.m.MessageBox.Action.OK
		//        });
		//        this.view.setBusy(false);
		//    },
		//    deleteOnlyDeletableItems: function (i) {
		//        var t = this;
		//        var m = this.oResourceBundle.getText("deleteItem");
		//        b.show(m, {
		//            icon: b.Icon.INFORMATION,
		//            title: this.oResourceBundle.getText("overviewDelete"),
		//            actions: [
		//                sap.m.MessageBox.Action.OK,
		//                sap.m.MessageBox.Action.CANCEL
		//            ],
		//            onClose: function (a) {
		//                if (a === sap.m.MessageBox.Action.OK) {
		//                    t.deleteItems(i);
		//                } else {
		//                    t.getView().setBusy(false);
		//                }
		//            },
		//            initialFocus: sap.m.MessageBox.Action.OK
		//        });
		//    },
		//    deleteItems: function (i) {
		//        if (i.length > 0) {
		//            var g = JSON.stringify(i);
		//            var h = this.getHeaderDraftKey().split("-").join("");
		//            this.itemsForDel = i.length;
		//            this.itemCount = this.view.getBindingContext().getProperty("NumberOfItems");
		//            this.oMessageManager.removeAllMessages();
		//            var p = this.getServiceCallParameter(this.deleteItemsSuccess, this.deleteItemsFailure);
		//            this.dataManager.deleteItems(p, g, h);
		//        } else {
		//            this.getView().setBusy(false);
		//        }
		//    },
		//    deleteItemsSuccess: function () {
		//        this.view.byId("deleteItem").setEnabled(false);
		//        this.view.byId("copyItem").setEnabled(false);
		//        this.view.byId("productsTable").removeSelections();
		//        this.view.byId("deleteLimitItemBtn").setEnabled(false);
		//        this.view.byId("copyLimitItemBtn").setEnabled(false);
		//        this.view.byId("limitItemsTable").removeSelections();
		//        sap.m.MessageToast.show(this.oResourceBundle.getText("delete"));
		//        if (this.itemsForDel === this.itemCount && this.getPurchaseRequisition() === "") {
		//            this.getRouter().navTo("Search");
		//        } else {
		//            var p = this.getServiceCallParameter(this.refreshCartSuccess, this.serviceFail);
		//            if (this.getExtScenarioFlag()) {
		//                this.dataManager.refreshCartOverviewPageData(p, this.oCartTable);
		//            } else {
		//                this.dataManager.refreshCartOverviewPageData(p, this.oCartTable, this.oLimitCartTable);
		//            }
		//        }
		//    },
		//    deleteItemsFailure: function () {
		//        this.setBusyIndicator(false);
		//    },
		//    refreshCartSuccess: function () {
		//        if (this.itemsForDel === this.itemCount && this.getPurchaseRequisition() !== "") {
		//            this.setBusyIndicator(false);
		//            sap.m.MessageBox.show(this.oResourceBundle.getText("myPRmsgDeleteLastItemCart"), {
		//                icon: sap.m.MessageBox.Icon.WARNING,
		//                title: this.oResourceBundle.getText("msgBoxTitle"),
		//                actions: [sap.m.MessageBox.Action.OK],
		//                styleClass: "sapUiSizeCompact",
		//                onClose: function (a) {
		//                    if (a === sap.m.MessageBox.Action.OK) {
		//                    }
		//                },
		//                initialFocus: sap.m.MessageBox.Action.OK
		//            });
		//        }
		//    },
		//    deletePRLimitItems: function () {
		//        this.setBusyIndicator(true);
		//        var s = this.view.byId("limitItemsTable").getSelectedItems();
		//        var o = this.getDeletableItemsAndDelIndicator(s);
		//        if (o.deletionPossible) {
		//            this.deleteAllDeletableItems(o.itemsForDeletion);
		//        } else {
		//            if (s.length === 1) {
		//                this.showItemDeletionErrorMessage(s[0]);
		//            } else {
		//                this.deleteOnlyDeletableItems(o.itemsForDeletion);
		//            }
		//        }
		//    },
		//    onPressAddItem: function (e) {
		//        this.view.setBusy(true);
		//        this.itemToAdd = "NORMAL_ITEM";
		//        this._addItem();
		//    },
		//    _addItem: function () {
		//        var v = this.view.getBindingContext();
		//        var p = this.getServiceCallParameter(this.onPressAddItemSuccess, this.onPressAddItemError);
		//        this.dataManager.addItemToCartOverviewTable(p, v.getProperty("PurReqnSSPRequestor"), v.getProperty("PurReqnSSPAuthor"));
		//    },
		//    onPressAddItemSuccess: function (o, r) {
		//        this.view.setBusy(false);
		//        if (r.statusCode === "200") {
		//            if (this.getHubSourceSystem() === this.getConnectedSystem()) {
		//                if (this.itemToAdd === "NORMAL_ITEM") {
		//                    if (this.getPurchaseRequisition()) {
		//                        this.oRouter.navTo("Search", {
		//                            DraftKey: this.getHeaderDraftKey(),
		//                            PurchaseRequisition: this.getPurchaseRequisition()
		//                        });
		//                    } else {
		//                        this.oRouter.navTo("Search");
		//                    }
		//                } else if (this.itemToAdd === "LIMIT_ITEM") {
		//                    this.goToCreateOwnLimitItemPage();
		//                }
		//            } else {
		//                sap.m.MessageBox.show(this.getResourceBundle().getText("addItemInEdit"), {
		//                    icon: sap.m.MessageBox.Icon.ERROR,
		//                    title: this.getResourceBundle().getText("MESSAGE_SEVERITY_ERROR"),
		//                    actions: [sap.m.MessageBox.Action.CLOSE],
		//                    styleClass: "sapUiSizeCompact",
		//                    onClose: function (a) {
		//                    },
		//                    initialFocus: sap.m.MessageBox.Action.CLOSE
		//                });
		//            }
		//        }
		//    },
		//    onPressAddItemError: function (e) {
		//        this.view.setBusy(false);
		//        var r = e.responseText;
		//        sap.m.MessageBox.error(JSON.parse(r).error.message.value);
		//    },
		//    onPressAddLimitItem: function () {
		//        this.view.setBusy(true);
		//        this.itemToAdd = "LIMIT_ITEM";
		//        this._addItem();
		//    },
		//    onPriceScaleClick: function (e) {
		//        var s = e.getSource();
		//        var t = this;
		//        if (!this._prcsclPopover) {
		//            F.load({
		//                name: "ui.s2p.mm.requisition.maintain.s1.view.PriceRange",
		//                controller: this
		//            }).then(function (o) {
		//                t._prcsclPopover = o;
		//                t.getView().addDependent(t._prcsclPopover);
		//                t.priceScaleFind(s);
		//            });
		//        } else {
		//            this.priceScaleFind(s);
		//        }
		//    },
		//    priceScaleFind: function (s) {
		//        var a = s.getParent().getParent().getBindingContext();
		//        this.curr = a.getProperty("Currency");
		//        var p = "OpnCtlgItemID eq " + a.getProperty("PurReqnSSPCrossCatalogItem");
		//        var q = a.getProperty("NetPriceQuantity");
		//        var e = a.getProperty("BaseUnit");
		//        q = this.oResourceBundle.getText("price") + " " + this.oResourceBundle.getText("CurrencyPer") + " " + q + " " + e;
		//        var m = this.getServiceCallParameter(this.priceScalefindSuccess, this.priceScalefindFailure);
		//        this.dataManager.priceScalefind(m, p);
		//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.view, this._prcsclPopover);
		//        jQuery.sap.delayedCall(0, this, function () {
		//            this._prcsclPopover.openBy(s);
		//        });
		//        this._prcsclPopover.getAggregation("content")[0].getAggregation("columns")[1].getAggregation("header").setText(q);
		//    },
		//    priceScalefindSuccess: function (a) {
		//        var j = new sap.ui.model.json.JSONModel(a);
		//        var l = j.getData().results.length;
		//        var i = 0;
		//        for (i = 0; i < l; i++) {
		//            j.getData().results[i].Currency = this.curr;
		//        }
		//        this._prcsclPopover.getContent()[0].setModel(j);
		//        this._prcsclPopover.getContent()[0].bindElement("/results");
		//    },
		//    priceScalefindFailure: function () {
		//    },
		//    onViewDetails: function (e) {
		//        this.setOrderDelete("stopNav");
		//        if (this._oMiniCart) {
		//            this._oMiniCart.destroy();
		//            this._oMiniCart = null;
		//        }
		//        var a = e.getSource().getBindingContext();
		//        var s = sap.ui.getCore().getConfiguration().getLanguage();
		//        s = s.substr(0, 2).toUpperCase();
		//        var p = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
		//        this.prNumber = p;
		//        if (a.getProperty("PurReqnSSPCrossCatalogItem")) {
		//            this.getRouter().navTo("ProductDetails", {
		//                OpnCtlgItemID: a.getProperty("PurReqnSSPCrossCatalogItem"),
		//                OpnCtlgWebServiceID: a.getProperty("PurReqnSSPCatalog"),
		//                view: "cartOverview",
		//                DraftKey: this.getHeaderDraftKey(),
		//                PurchaseRequisition: p,
		//                free: a.getProperty("DraftUUID"),
		//                Language: s
		//            });
		//        }
		//    },
		//    viewItemStatusDetails: function (e) {
		//        this.statusButton = e.getSource();
		//        var t = this;
		//        if (this.rejStatusDialog) {
		//            this.rejStatusDialog.destroy();
		//            this.rejStatusDialog = null;
		//        }
		//        F.load({
		//            name: "ui.s2p.mm.requisition.maintain.s1.fragment.RejectedStatus",
		//            controller: this
		//        }).then(function (o) {
		//            t.rejStatusDialog = o;
		//            t.getView().addDependent(t.rejStatusDialog);
		//            var r = t.oSourcePRApprovalDetailsJSONModel.getData().results;
		//            var g = t.statusButton.getBindingContext().getProperty("SourcePurchaseRequisitionItem");
		//            for (var i = 0; i < r.length; i++) {
		//                if (r[i].SourcePurchaseRequisitionItem === g) {
		//                    t.rejStatusDialog.setModel(t.oSourcePRApprovalDetailsJSONModel);
		//                    var a = "/results/" + i;
		//                    t.rejStatusDialog.bindElement(a);
		//                    break;
		//                }
		//            }
		//            t.rejStatusDialog.openBy(t.statusButton);
		//        });
		//    },
		//    handleReturnPress: function () {
		//        var o = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		//        o.toExternal({
		//            target: {
		//                semanticObject: "GoodsReceipt",
		//                action: "return"
		//            },
		//            params: { PurchaseRequisition: [this.currentPRNumber] }
		//        });
		//    },
		//    handleConfirmPress: function () {
		//        var o = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		//        o.toExternal({
		//            target: {
		//                semanticObject: "GoodsReceipt",
		//                action: "create"
		//            },
		//            params: { PurchaseRequisition: [this.currentPRNumber] }
		//        });
		//    },
		//    handleDeleteCartPress: function () {
		//        var t = this;
		//        sap.m.MessageBox.show(t.getResourceBundle().getText("msgDiscardCart"), {
		//            icon: sap.m.MessageBox.Icon.WARNING,
		//            title: t.getResourceBundle().getText("msgBoxTitle"),
		//            actions: [
		//                sap.m.MessageBox.Action.OK,
		//                sap.m.MessageBox.Action.CANCEL
		//            ],
		//            styleClass: "sapUiSizeCompact",
		//            onClose: function (a) {
		//                if (a === sap.m.MessageBox.Action.OK) {
		//                    t.dataManager.deleteExistingDraft(t.getServiceCallParameter(t.onSuccessDeleteHeader, t.serviceFail), t.getHeaderDraftKey(), t.getPurchaseRequisition());
		//                    t.setOrderDelete(true);
		//                    t.getView().setBusy(true);
		//                    if (this._oMiniCart) {
		//                        this._oMiniCart.destroy();
		//                        this._oMiniCart = null;
		//                    }
		//                }
		//            },
		//            initialFocus: sap.m.MessageBox.Action.OK
		//        });
		//    },
		//    onSuccessDeleteHeader: function () {
		//        sap.m.MessageToast.show(this.oResourceBundle.getText("deleteAll"));
		//        if (this.getCopyScenarioFlag()) {
		//            this.getRouter().navTo("PurReqList");
		//        } else if (this.getPurchaseRequisition() === "") {
		//            this.getRouter().navTo("Search");
		//        } else {
		//            this.getRouter().navTo("PurReqList");
		//        }
		//    },
		//    handleExpertOrderCartPress: function () {
		//        var i = this.getView().byId("productsTable").getItems()[0].getBindingContext().getPath();
		//        var t = this;
		//        if (!this._oExtDocumentVH) {
		//            F.load({
		//                name: "ui.s2p.mm.requisition.maintain.s1.fragment.ExpertMode",
		//                controller: this
		//            }).then(function (o) {
		//                t._oExtDocumentVH = o;
		//                t.getView().addDependent(t._oExtDocumentVH);
		//                t._oExtDocumentVH.bindElement(i);
		//                if (t.getTestMode()) {
		//                    var a = new sap.ui.model.Context(t._oExtDocumentVH.getModel(), t._oExtDocumentVH.getElementBinding().getPath());
		//                    t._oExtDocumentVH.setBindingContext(a);
		//                }
		//                t._oExtDocumentVH.open();
		//            });
		//        } else {
		//            this._oExtDocumentVH.open();
		//        }
		//    },
		//    onExpertModeCancelPress: function () {
		//        if (this._oExtDocumentVH) {
		//            this._oExtDocumentVH.destroy();
		//            this._oExtDocumentVH = null;
		//        }
		//    },
		//    onExpertModeOrderPress: function (e) {
		//        if (this.getTestMode()) {
		//            var a = new sap.ui.model.Context(this._oExtDocumentVH.getModel(), this._oExtDocumentVH.getElementBinding().getPath());
		//            e.getSource().setBindingContext(a);
		//        }
		//        var g = e.getSource().getBindingContext().getProperty("ExtPurchaseRequisitionType");
		//        this.setExtSourceSystem(e.getSource().getBindingContext().getProperty("ProcurementHubSourceSystem"));
		//        if (this.validateQuantity()) {
		//            sap.ui.core.BusyIndicator.show(0);
		//            this.clearMessages();
		//            var i = this.getView().byId("productsTable").getItems();
		//            var h = [];
		//            var p;
		//            for (var j = 0; j < i.length; j++) {
		//                p = this.getView().byId("productsTable").getItems()[j].getBindingContext().getPath();
		//                this.getModel().setProperty(p + "/ExtPurchaseRequisitionType", g);
		//                h.push(this.getModel().getProperty(p));
		//            }
		//            var k = { PurReqnIsCreatedInExpertMode: true };
		//            var P = this.getServiceCallParameter(this.onExpertModeOrderPressSuccess, this.onExpertModeOrderPressFailure);
		//            this.dataManager.updateHeaderAndItems(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), k, h);
		//        }
		//    },
		//    onExpertModeOrderPressSuccess: function (o) {
		//        var p = this.getServiceCallParameter(this.onExpertPROrderSuccess, this.onExpertPROrderFailure);
		//        this.dataManager.activateDocument(p, this.getHeaderDraftKey(), this.getPurchaseRequisition());
		//    },
		//    onExpertModeOrderPressFailure: function () {
		//        sap.ui.core.BusyIndicator.hide();
		//    },
		//    onExpertPROrderSuccess: function (o) {
		//        if (this._oExtDocumentVH) {
		//            this._oExtDocumentVH.destroy();
		//            this._oExtDocumentVH = null;
		//        }
		//        if (this.expertPRSuccessDialog) {
		//            this.expertPRSuccessDialog.destroy();
		//            this.expertPRSuccessDialog = null;
		//        }
		//        var t = this;
		//        F.load({
		//            name: "ui.s2p.mm.requisition.maintain.s1.fragment.ExpertOrderSuccess",
		//            controller: this
		//        }).then(function (a) {
		//            t.expertPRSuccessDialog = a;
		//            t.getView().addDependent(t.expertPRSuccessDialog);
		//            var p = {};
		//            p.hubPRNo = "";
		//            p.connSysPRNo = "";
		//            t.expertPRJSONModel = new sap.ui.model.json.JSONModel(p);
		//            t.expertPRSuccessDialog.setModel(t.expertPRJSONModel, "expertPRJSONModel");
		//            t.expertPRSuccessDialog.setModel(t.getView().getModel("i18n"), "i18n");
		//            t.expertPRJSONModel.setProperty("/hubPRNo", o.PurchaseRequisition);
		//            t.expertPRSuccessDialog.open();
		//            t.setOrderDelete(true);
		//            var P = t.getServiceCallParameter(t.getExtPRDetailsSuccess, t.getExtPRDetailsFailure);
		//            t.dataManager.getExtPRDetails(P, o.PurchaseRequisition);
		//        });
		//    },
		//    onExpertPROrderFailure: function () {
		//        this.setExtSourceSystem("");
		//        var i = this.getView().byId("productsTable").getItems();
		//        var a = [];
		//        var p;
		//        for (var e = 0; e < i.length; e++) {
		//            p = this.getView().byId("productsTable").getItems()[e].getBindingContext().getPath();
		//            this.getModel().setProperty(p + "/ExtPurchaseRequisitionType", "");
		//            a.push(this.getModel().getProperty(p));
		//        }
		//        var h = { PurReqnIsCreatedInExpertMode: false };
		//        var P = this.getServiceCallParameter(this.onRevertExpertModeSuccess, this.onRevertExpertModeFailure);
		//        this.dataManager.updateHeaderAndItems(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), h, a);
		//    },
		//    onRevertExpertModeSuccess: function () {
		//        sap.ui.core.BusyIndicator.hide();
		//    },
		//    onRevertExpertModeFailure: function () {
		//        sap.ui.core.BusyIndicator.hide();
		//    },
		//    getExtPRDetailsSuccess: function (o) {
		//        if (o.results[0]) {
		//            this.expertPRJSONModel.setProperty("/connSysPRNo", o.results[0].ExtPurchaseRequisition);
		//        }
		//        sap.ui.core.BusyIndicator.hide();
		//    },
		//    getExtPRDetailsFailure: function () {
		//        sap.ui.core.BusyIndicator.hide();
		//    },
		//    onExpertModeSuccessOKPress: function () {
		//        this.expertPRSuccessDialog.close();
		//    },
		//    onExpertModeSuccessClose: function () {
		//        var t = this;
		//        setTimeout(function () {
		//            if (!t.getCopyScenarioFlag()) {
		//                t.getRouter().navTo("Search");
		//            } else {
		//                t.getRouter().navTo("PurReqList");
		//            }
		//        }, 2000);
		//    },
		//    onHubPRNoPress: function (e) {
		//        var h = e.getSource().getText();
		//        var o = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		//        o.toExternal({
		//            target: {
		//                semanticObject: "PurchaseRequisition",
		//                action: "displayFactSheet"
		//            },
		//            params: { PurchaseRequisition: [h] }
		//        });
		//    },
		//    onConnSysPRNoPress: function (e) {
		//        var a = e.getSource().getText();
		//        var m = this.getView().getModel();
		//        var t = this;
		//        var p = {
		//            method: "GET",
		//            urlParameters: {
		//                "Mode": "03",
		//                "CentralRequisition": a
		//            },
		//            success: function (o, r) {
		//                var g = sap.ushell.Container.getService("CrossApplicationNavigation");
		//                if (o.IS_CLOUD === "X") {
		//                    g.toExternal({
		//                        target: {
		//                            semanticObject: "PurchaseRequisition",
		//                            action: "manageAdvanced"
		//                        },
		//                        params: {
		//                            "BusinessSystemId": t.getExtSourceSystem(),
		//                            "PurchasingDocumentNumber": o.ConnectedSystemPR,
		//                            "TransactionParameters": o.TransactionParameter,
		//                            "PurchasingDocumentCategory": "B",
		//                            "Transaction": o.Transaction
		//                        }
		//                    });
		//                } else {
		//                    g.toExternal({
		//                        target: {
		//                            semanticObject: "PurchaseRequisition",
		//                            action: "manageAdvanced"
		//                        },
		//                        params: {
		//                            "sap-system": t.getExtSourceSystem(),
		//                            "PurchaseDocument": o.ConnectedSystemPR,
		//                            "sap-ushell-navmode": "explace",
		//                            "PurchasingDocumentCategory": "B"
		//                        }
		//                    });
		//                }
		//                t.getView().setBusy(false);
		//                t.setOrderDelete(true);
		//            },
		//            error: function (E) {
		//                var s = JSON.parse(E.responseText);
		//                sap.m.MessageBox.error(s.error.message.value);
		//                t.getView().setBusy(false);
		//            }
		//        };
		//        m.callFunction("/GetNavigationTarget", p);
		//    },
		//    onBack: function () {
		//        if (this.getPurchaseRequisition() === "") {
		//            this.setSourcePage("FreeText");
		//        } else {
		//            this.setSourcePage("PurReqList");
		//        }
		//        this.setOrderDelete("dontStopNav");
		//        if (this._oMiniCart) {
		//            this._oMiniCart.destroy();
		//            this._oMiniCart = null;
		//        }
		//        if (this.oWorkflowComponent) {
		//            this.oWorkflowComponent.destroy(true);
		//            this.oWorkflowComponent = null;
		//        }
		//        var h = H.getInstance();
		//        var p = h.getPreviousHash();
		//        if (p !== undefined) {
		//            window.history.go(-1);
		//        } else {
		//            if (this.oComponent.getComponentData().startupParameters.mode[0] === "create") {
		//                this.setSourcePage("FreeText");
		//                this.oRouter.navTo("Search", {}, {}, true);
		//            } else {
		//                this.setSourcePage("PurReqList");
		//                this.oRouter.navTo("PurReqList", {}, {}, true);
		//            }
		//        }
		//    },
		//    onExit: function () {
		//        this.setOrderDelete("dontStopNav");
		//        if (this._oMiniCart) {
		//            this._oMiniCart.destroy();
		//            this._oMiniCart = null;
		//        }
		//        if (this.oWorkflowComponent) {
		//            this.oWorkflowComponent.destroy(true);
		//            this.oWorkflowComponent = null;
		//        }
		//    },
		//    handleClose: function () {
		//    }
	});
});