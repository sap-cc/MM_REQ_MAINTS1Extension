sap.ui.define([
	"ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"ui/s2p/mm/requisition/maintain/s1/model/formatter",
	"ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (B, J, M, f, E, a, H) {
	"use strict";
	var p = new Object();
	p.closed = true;
	return sap.ui.controller("ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.controller.SearchCustom", {
		    onInit: function () {
		        // this.view = this.getView();
		        // this.getView().setBusy(true);
		        // this.oView.setVisible(false);
		        // this.oModel = this.getAppModel();
		        // this.getResourceBundle();
		        // this._oModel = this.getAppModel();
		        // sap.ui.getCore().getMessageManager().removeAllMessages();
		        // var b = sap.ui.core.routing.HashChanger.getInstance().getHash();
		        // b = b.split("/");
		        // if (b[1] && b[2]) {
		        //     this.setHeaderDraftKey(b[1]);
		        //     this.setPurchaseRequisition(b[2]);
		        // }
		        // this.showSearchByImageLinkIfImageBasedBuyingActive();
		        // this._oView = this.getView();
		        // this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		        // this._oRouter = this._oComponent.getRouter();
		        // var c = this.getPurchaseRequisition();
		        // if (c === "" || c === undefined) {
		        //     if (!this.getCopyScenarioFlag() && this._oComponent.getComponentData().showUserPopup) {
		        //         this.genInfo();
		        //     }
		        // }
		        // this.getRouter().getRoute("Search").attachPatternMatched(this._handleRouteMatched, this);
		        // this.oSplitContainer = this.getView().byId("mySplitContainer");
		        // this.oSplitContainer.setShowSecondaryContent(false);
		        // this.getView().byId("catalogText").setEnabled(false);
		        // this.getView().byId("filterBtn").setVisible(false);
		        // this.filters = {};
		        // this.selectedValue = "";
		        // this.bDescending = true;
		        
		        this._getUserDefaultSettings();

		    },
		    
		    /**
		     * Get user settings
		     * @private
		     */
			_getUserDefaultSettings: function () {
				var oI18n = this.getResourceBundle();
				var that = this;
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter("IsActiveEntity", sap.ui.model.FilterOperator.EQ, true));
				aFilter.push(new sap.ui.model.Filter("Employee", sap.ui.model.FilterOperator.EQ, "=0"));
				aFilter.push(new sap.ui.model.Filter("BusinessObjectType", sap.ui.model.FilterOperator.EQ, "PR"));
				
				var oUdsModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/USERDEFAULTS/");
				oUdsModel.read("/C_UserDefaultSettingItem", {
					filters: aFilter,
					success: function(oData, oResponse) {
						var oJsonModel = new J();
						oJsonModel.setData(oData);
						sap.ui.getCore().setModel(oJsonModel, "usersettings");
						// Copy original
						that._oUsersettingsDefault = jQuery.extend({}, oJsonModel.getData().results[0]);
						that._openAccountAssignmentCategory();
					},
					error: function(oError) {
						var sMessage = JSON.parse(oError.responseText).error.message.value;
						M.show(sMessage, {
							title: oI18n.getText("serverError"),
							icon: sap.m.MessageBox.Icon.ERROR
						});
					}
				});
			},
			
			/**
			 * Open dialog for account assignment
			 * @private
			 */
			_openAccountAssignmentCategory: function () {
				var oUsersettings = sap.ui.getCore().getModel("usersettings").getData().results[0];
				var that = this;
				var oI18n = that.getView().getModel("i18n");
				var oUdsModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/USERDEFAULTS/");
				oUdsModel.read("/I_AccAssgnmtCategory", {
					urlParameters: {
						"$orderby": "AccountAssignmentCategory asc",
						"search-focus": "AccountAssignmentCategory",
						"$select": "AccountAssignmentCategory,AcctAssignmentCategoryName"
					},
					success: function(oData, oResponse) {
						var oJsonModel = new J();
						oJsonModel.setData(oData);
						sap.ui.getCore().setModel(oJsonModel, "accountcategory");
						
						// Dialog oeffnen
						that._oDialog = sap.ui.xmlfragment(
							"ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.fragment.AccountAssignmentCategory",
							that
						);
						
						that._oDialog.setModel(oI18n, "i18n");
						that._oDialog.open();
						if (oUsersettings.AccountAssignmentCategory.length > 0) {
							var sCat = oUsersettings.AccountAssignmentCategory;
							// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
							if (sCat === "A" || sCat === "F" || sCat === "K" || sCat === "Q" || sCat === "P") {
								sap.ui.getCore().byId("inpAccObject").setVisible(true);
							} else {
								sap.ui.getCore().byId("inpAccObject").setVisible(false);
							}
						}
						sap.ui.getCore().byId("inpAccCategory").setValue(oUsersettings.AccountAssignmentCategory);
						sap.ui.getCore().byId("txtAccCategory").setText(oUsersettings.AccountAssignmentCategory_Text);
						
						switch (oUsersettings.AccountAssignmentCategory) {
							case "A":
								sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.Asset);
								break;
							case "F":
								sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.OrderID);
								break;
							case "K":
								sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.CostCenter);
								break;
							case "Q":
								sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.WBSElement);
								break;
							// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
							case "P":
								sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.WBSElement);
								break;
						}
						that._sCategoryId = oUsersettings.AccountAssignmentCategory;
						that._getAccountAssignmentObject(that._sCategoryId);
					},
					error: function(oError) {
						var sMessage = JSON.parse(oError.responseText).error.message.value;
						M.show(sMessage, {
							title: oI18n.getResourceBundle().getText("serverError"),
							icon: sap.m.MessageBox.Icon.ERROR
						});
					}
				});
			},
			
			/**
			 * Close dialog of account assignment category.
			 * (cancel, currently deactivated)
			 * @public
			 */
			onPopupClose: function() {
				this._oDialog.close();
				this._oDialog.destroy();
			},
			
			/**
			 * Close dialog of account assignment category and save data (user settings)
			 * @public
			 */
			onPopupSave: function() {
				var oI18n = this.getResourceBundle();
				var sCat = sap.ui.getCore().byId("inpAccCategory").getValue().toUpperCase();
				var oObj = sap.ui.getCore().byId("inpAccObject");
				
				if (sCat.length > 0) {
					var oUsersettings = sap.ui.getCore().getModel("usersettings").getData().results[0];
					oUsersettings.AccountAssignmentCategory = sCat;
					oUsersettings.AccountAssignmentCategory_Text = sap.ui.getCore().byId("txtAccCategory").getText();
					
					if (oObj.getVisible()) {
						if (oObj.getValue().length > 0) {
							switch (sCat) {
								case "A":
									oUsersettings.Asset = oObj.getValue();
									break;
								case "F":
									oUsersettings.OrderID = oObj.getValue();
									break;
								case "K":
									oUsersettings.CostCenter = oObj.getValue();
									break;
								case "Q":
									oUsersettings.WBSElement = oObj.getValue();
									break;
								// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
								case "P":
									oUsersettings.WBSElement = oObj.getValue();
									break;
							}
						} else {
							a.show(oI18n.getText("accountAssignmentMessage"));
							return;
						}
					}
					
					var oBusyDialog = new sap.m.BusyDialog();
					//var oBusyDialog = sap.ui.core.BusyIndicator;
					oBusyDialog.open();
					
					var that = this;
					var aFilter = [];
					aFilter.push(new sap.ui.model.Filter("IsActiveEntity", sap.ui.model.FilterOperator.EQ, true));
					aFilter.push(new sap.ui.model.Filter("Employee", sap.ui.model.FilterOperator.EQ, "=0"));
					var oUdsModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/USERDEFAULTS/");
					oUdsModel.read("/C_Userdefaultsetting", {
						filters: aFilter,
						success: function(oData, oResponse) {
							var oJsonModel = new J();
							oJsonModel.setData(oData.results[0]);
							var oPayload = {
								"Activation_ac": oJsonModel.getData().Activation_ac,
								"Edit_ac": oJsonModel.getData().Edit_ac,
								"Preparation_ac": oJsonModel.getData().Preparation_ac,
								"Validation_ac": oJsonModel.getData().Validation_ac,
								"EmployeeForEdit": oJsonModel.getData().Employee,
								"EmployeeRange": oJsonModel.getData().Employee,
								"IsBusinessPurposeCompleted": oJsonModel.getData().IsBusinessPurposeCompleted,
								"AuthorizationGroup": oJsonModel.getData().AuthorizationGroup,
								"UserID": oJsonModel.getData().UserID,
								"CompanyCode": oJsonModel.getData().CompanyCode,
								"Person": oJsonModel.getData().Person,
								"FullName":oJsonModel.getData().FullName,
								"PersonWorkAgrmtAuthznGrpg": oJsonModel.getData().PersonWorkAgrmtAuthznGrpg,
								"HasDraftEntity": oJsonModel.getData().HasDraftEntity,
								"DraftUUID": oJsonModel.getData().DraftUUID,
								"HasActiveEntity": oJsonModel.getData().HasActiveEntity
							};
							
							// POST C_Userdefaultsetting
							oUdsModel.create("/C_Userdefaultsetting", oPayload, {
								success: function(oData1, oResponse1) {
									
									var sPostUrl =	"(Employee='" + oData1.Employee + "'," + 
													"PersonalizationID=guid'" + oData1.PersonalizationID + "'," +
													"DraftUUID=guid'" + oData1.DraftUUID + "'," +
													"IsActiveEntity=" + oData1.IsActiveEntity + "" +
													")/to_Userdefaultsettingitemwd";
												
									aFilter.push(new sap.ui.model.Filter("BusinessObjectType", sap.ui.model.FilterOperator.EQ, "PR"));
								
									oUdsModel.read("/C_UserDefaultSettingItem", {
										filters: aFilter,
										success: function(oData2, oResponse2) {
											oJsonModel = new J();
											oJsonModel.setData(oData2.results[0]);
											
											oPayload = oJsonModel.getData();
											oPayload.BusinessObjectTypeForEdit = "PR";
											delete oPayload.BusinessObjectType;
											delete oPayload.DraftAdministrativeData;
											delete oPayload.DraftEntityCreationDateTime;
											delete oPayload.DraftEntityLastChangeDateTime;
											delete oPayload.Employee;
											delete oPayload.IsActiveEntity;
											delete oPayload.LastChangeDateTime;
											delete oPayload.PersonalizationID;
											delete oPayload.SiblingEntity;
											delete oPayload.__metadata;
											delete oPayload.to_AccAssgnmtCategory;
											delete oPayload.to_AcctAssignmentCategoryText;
											delete oPayload.to_Currency;
											delete oPayload.to_CurrencyText;
											delete oPayload.to_ExtPurchasingDocumentType;
											delete oPayload.to_MaterialGroupText;
											delete oPayload.to_MM_FixedAssetValueHelp;
											delete oPayload.to_MM_WBSElementByIntKeyVH;
											delete oPayload.to_MM_WBSElementValueHelp;
											delete oPayload.to_Plant;
											delete oPayload.to_PurchasingDocumentType;
											delete oPayload.to_PurchasingGroup;
											delete oPayload.to_SSPPurgOrgVH;
											delete oPayload.to_StorageLocation;
											delete oPayload.to_SupplyingPlant;
											delete oPayload.to_Usercatalogswithdraft;
											delete oPayload.to_UserdefaultSettingWd;
											delete oPayload.to_Userdetails;
											delete oPayload.to_UserRequisitioningGroupsWD;
								
											// POST
											oUdsModel.create("/C_Userdefaultsetting" + sPostUrl, oPayload, {
												success: function(oData3, oResponse3) {
													
													aFilter.pop();
													// Catalog
													oUdsModel.read("/C_Usercatalogs", {
														filters: aFilter,
														success: function(oDataCat, oResponseCat) {
															
															// fuer jeden Katalog
															var aFunction = [];
															for (var i = 0; i < oDataCat.results.length; i++) {
																var sPostCatUrl =	"(Employee=''," + 
																					"PersonalizationID=guid'" + oDataCat.results[i].PersonalizationID + "'," +
																					"BusinessObjectType=''," +
																					"DraftUUID=guid'" + oData3.DraftUUID + "'," +
																					"IsActiveEntity=" + oDataCat.results[i].IsActiveEntity + "" +
																					")/to_Usercatalogswithdraft";
																var oPayloadCat = oDataCat.results[i];
																oPayloadCat.BusinessObjectTypeForEdit = oData3.BusinessObjectTypeForEdit;
																oPayloadCat.EmployeeForEdit = oData1.EmployeeForEdit;
																delete oPayloadCat.BusinessObjectType;
																delete oPayloadCat.DraftAdministrativeData;
																delete oPayloadCat.DraftEntityCreationDateTime;
																delete oPayloadCat.DraftEntityLastChangeDateTime;
																delete oPayloadCat.Employee;
																delete oPayloadCat.PersonalizationID;
																delete oPayloadCat.PurReqnSSPCatalog;
																delete oPayloadCat.SiblingEntity;

																aFunction.push(that._postCatalogs(sPostCatUrl, oPayloadCat) );
															}
															
															Promise.all(aFunction).then(function() {
																
																oUsersettings.BusinessObjectTypeForEdit = "PR";
																oUsersettings.BusinessObjectType = "";
																oUsersettings.DraftUUID = oData3.DraftUUID;
																oUsersettings.DraftEntityCreationDateTime = oData3.DraftEntityCreationDateTime;
																oUsersettings.DraftEntityLastChangeDateTime = oData3.DraftEntityLastChangeDateTime;
																oUsersettings.IsActiveEntity = false;
																oUsersettings.LastChangeDateTime = null;
																oUsersettings.Employee = "";
																oUsersettings.FullName = "";
																oUsersettings.Person = "";
																oUsersettings.PersonalizationID = "00000000-0000-0000-0000-000000000000";
																oUsersettings.PersonWorkAgrmtAuthznGrpg = "";
																oUsersettings.Preparation_ac = true;
																oUsersettings.UserID = "";
																oUsersettings.Validation_ac = true;
															
																delete oUsersettings.HasActiveEntity;
																delete oUsersettings.HasDraftEntity;
																delete oUsersettings.ParentDraftUUID;
																delete oUsersettings.ShopOnBehalfType;
																
																sPostUrl =	"(Employee=''," + 
																			"PersonalizationID=guid'00000000-0000-0000-0000-000000000000'," +
																			"BusinessObjectType=''," +
																			"DraftUUID=guid'" + oData3.DraftUUID + "'," +
																			"IsActiveEntity=" + oData3.IsActiveEntity + "" +
																			")";
																// MERGE
																oUdsModel.update("/C_UserDefaultSettingItem" + sPostUrl, oUsersettings, {
																	success: function(oData4, oResponse4) {
																		// POST
																		oUdsModel.callFunction("/C_UserdefaultsettingActivation", {
																			urlParameters: {
																				DraftUUID:			oData1.DraftUUID ,
																				PersonalizationID:	"00000000-0000-0000-0000-000000000000",
																				Employee:			"",
																				IsActiveEntity:		oData3.IsActiveEntity
																			},
																			method: "POST",
																			success: function(oData5, oResponse5) {
																				that.onPopupClose();
																				oBusyDialog.close();
																				that._handleRouteMatched();
																			},
																			error: function(oError) {
																				oBusyDialog.close();
																				var sMessage = JSON.parse(oError.responseText).error.message.value;
																				M.show(sMessage, {
																					title: oI18n.getText("serverError"),
																					icon: sap.m.MessageBox.Icon.ERROR
																				});
																			}
																		});
																	},
																	error: function(oError) {
																		oBusyDialog.close();
																		var sMessage = JSON.parse(oError.responseText).error.message.value;
																		M.show(sMessage, {
																			title: oI18n.getText("serverError"),
																			icon: sap.m.MessageBox.Icon.ERROR
																		});
																	}
																});
																
																that._handleDataError.bind(that);
															}); // Promise.all
														},
														error: function(oError) {
															oBusyDialog.close();
															var sMessage = JSON.parse(oError.responseText).error.message.value;
															M.show(sMessage, {
																title: oI18n.getText("serverError"),
																icon: sap.m.MessageBox.Icon.ERROR
															});
														}
													});
												},
												error: function(oError) {
													oBusyDialog.close();
													var sMessage = JSON.parse(oError.responseText).error.message.value;
													M.show(sMessage, {
														title: oI18n.getText("serverError"),
														icon: sap.m.MessageBox.Icon.ERROR
													});
												}
											});
										},
										error: function(oError) {
											oBusyDialog.close();
											var sMessage = JSON.parse(oError.responseText).error.message.value;
											M.show(sMessage, {
												title: oI18n.getText("serverError"),
												icon: sap.m.MessageBox.Icon.ERROR
											});
										}
									});
								},
								error: function(oError) {
									oBusyDialog.close();
									var sMessage = JSON.parse(oError.responseText).error.message.value;
									M.show(sMessage, {
										title: oI18n.getText("serverError"),
										icon: sap.m.MessageBox.Icon.ERROR
									});
								}
							});
						},
						error: function(oError) {
							oBusyDialog.close();
							var sMessage = JSON.parse(oError.responseText).error.message.value;
							M.show(sMessage, {
								title: oI18n.getText("serverError"),
								icon: sap.m.MessageBox.Icon.ERROR
							});
						}
					});
					
				} else {
					oBusyDialog.close();
					a.show(oI18n.getText("accountAssignmentMessage"));
				}
				
			},
			
			/**
			 * Account assignment category:
			 * open value help dialog
			 * @public
			 */
			onValueHelp: function (oEvent) {
				if (!this._oHelpValueDialog) {
					var oI18n = this.getView().getModel("i18n");
					this._oHelpValueDialog = sap.ui.xmlfragment(
						"ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.fragment.CategoryHelp",
						this
					);
					this._oHelpValueDialog.setModel(oI18n, "i18n");
					this._oHelpValueDialog.open();
				} else {
					this._oHelpValueDialog.open();
				}
			},
			
			/**
			 * Account assignment object:
			 * open value help dialog
			 * @public
			 */
			onObjectValueHelp: function (oEvent) {
				if (!this._oObjectHelpValueDialog) {
					var oI18n = this.getView().getModel("i18n");
					this._oObjectHelpValueDialog = sap.ui.xmlfragment(
						"ui.s2p.mm.requisition.maintain.s1.MM_REQ_MAINTS1Extension.fragment.ObjectHelp",
						this
					);
					this._oObjectHelpValueDialog.setModel(oI18n, "i18n");
					this._oObjectHelpValueDialog.open();
				} else {
					this._oObjectHelpValueDialog.open();
				}
			},
			
			/**
			 * Close dialog of account assignment category:
			 * Enter pressed in input control.
			 * @public
			 */
			onSubmit: function (oEvent) {
				var oAccCatModel = sap.ui.getCore().getModel("accountcategory").getData();
				var sKey = oEvent.getSource().getSelectedKey();
				if (sKey === "") {
					sKey = sap.ui.getCore().byId("inpAccCategory").getValue().toUpperCase();
				}
				var sDesc = "";
				for (var key in oAccCatModel.results) {
					if (sKey === oAccCatModel.results[key].AccountAssignmentCategory ) {
						sDesc = oAccCatModel.results[key].AcctAssignmentCategoryName;
					}
				}
				this._sCategoryId = sKey;
				sap.ui.getCore().byId("txtAccCategory").setText(sDesc);
				// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf) => "P"
				if (sKey === "A" || sKey === "F" || sKey === "K" || sKey === "Q" || sKey === "P") {
					sap.ui.getCore().byId("inpAccObject").setVisible(true);
					this._getAccountAssignmentObject(sKey);
				} else {
					sap.ui.getCore().byId("inpAccObject").setVisible(false);
				}
				
			},
			
			/**
			 * Get account assignment object of category
			 * @private
			 */
			_getAccountAssignmentObject: function (sCat) {
				var sEntity = "";
				var oUrlParams;
				var oUsersettings = sap.ui.getCore().getModel("usersettings").getData().results[0];
				switch (sCat) {
					case "A":
						sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.Asset);
						sEntity = "/C_SSPFixedAssetVH";
						oUrlParams = {
							"$orderby": "MasterFixedAsset asc",
							"search-focus": "MasterFixedAsset",
							"$select": "MasterFixedAsset,FixedAssetDescription,CompanyCode,AssetClass,AssetCapitalizationDate"
						};
						break;
					case "F":
						sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.OrderID);
						sEntity = "/C_SSPLogisticsOrderVH";
						oUrlParams = {
							"$orderby": "OrderID asc",
							"search-focus": "OrderID",
							"$select": "OrderID,OrderDescription,OrderType,ControllingArea"
						};
						break;
					case "K":
						sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.CostCenter);
						sEntity = "/C_SSPCostCenterVH";
						oUrlParams = {
							"$orderby": "CostCenter asc",
							"search-focus": "CostCenter",
							"$select": "CostCenter,CostCenter_Text,CompanyCode,CostCtrResponsiblePersonName,ValidityStartDate,ValidityEndDate,CostCenter_Text"
						};
						break;
					case "Q":
						sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.WBSElement);
						sEntity = "/C_SSPWrkBrkdwnStrucElementVH";
						oUrlParams = {
							"$orderby": "WBSElement asc",
							"search-focus": "WBSElement",
							"$select": "WBSElement,WBSDescription,Project,WBSElementShortID,WBSDescription"
						};
						break;
					// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
					case "P":
						sap.ui.getCore().byId("inpAccObject").setValue(oUsersettings.WBSElement);
						sEntity = "/C_SSPWrkBrkdwnStrucElementVH";
						oUrlParams = {
							"$orderby": "WBSElement asc",
							"search-focus": "WBSElement",
							"$select": "WBSElement,WBSDescription,Project,WBSElementShortID,WBSDescription"
						};
						break;
				}
				
				var oI18n = this.getView().getModel("i18n").getResourceBundle();
				
				var oUdsModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/USERDEFAULTS/");
				oUdsModel.read(sEntity, {
					urlParameters: oUrlParams,
					success: function(oData, oResponse) {
						var oJsonModel = new J();
						oJsonModel.setData(oData);
						sap.ui.getCore().setModel(oJsonModel, "accountobject");
					},
					error: function(oError) {
						var sMessage = JSON.parse(oError.responseText).error.message.value;
						M.show(sMessage, {
							title: oI18n.getText("serverError"),
							icon: sap.m.MessageBox.Icon.ERROR
						});
					}
				});
			},
			
			/**
			 * Account assignment category:
			 * search in value help
			 * @public
			 */
			onValueHelpSearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				//var oFilter = new sap.ui.model.Filter("AccountAssignmentCategory", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("AccountAssignmentCategory", sap.ui.model.FilterOperator.Contains, sValue),
						new sap.ui.model.Filter("AcctAssignmentCategoryName", sap.ui.model.FilterOperator.Contains, sValue)
					], false);
				oEvent.getSource().getBinding("items").filter([oFilter]);
			},
			
			/**
			 * Account assignment category:
			 * close value help dialog
			 * @public
			 */
			onValueHelpClose: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					return;
				}
				var sCat = oSelectedItem.getTitle();
				this._sCategoryId = sCat;
				sap.ui.getCore().byId("inpAccCategory").setValue(sCat);
				sap.ui.getCore().byId("txtAccCategory").setText(oSelectedItem.getInfo());
				// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf) => "P"
				if (sCat === "A" || sCat === "F" || sCat === "K" || sCat === "Q" || sCat === "P") {
					sap.ui.getCore().byId("inpAccObject").setVisible(true);
					this._getAccountAssignmentObject(sCat);
				} else {
					sap.ui.getCore().byId("inpAccObject").setVisible(false);
				}
			},
			
			/**
			 * Account assignment object:
			 * search in value help
			 * @public
			 */
			onObjectValueHelpSearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var sTitle = "";
				var sInfo = "";
				switch (this._sCategoryId) {
					case "A":
						sTitle = "MasterFixedAsset";
						sInfo = "FixedAsset";
						break;
					case "F":
						sTitle = "OrderID";
						sInfo = "OrderDescription";
						break;
					case "K":
						sTitle = "CostCenter";
						sInfo = "CostCenter_Text";
						break;
					case "Q":
						sTitle = "WBSElement";
						sInfo = "WBSDescription";
						break;
					// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
					case "P":
						sTitle = "WBSElement";
						sInfo = "WBSDescription";
						break;
				}
				var oFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter(sTitle, sap.ui.model.FilterOperator.Contains, sValue),
						new sap.ui.model.Filter(sInfo, sap.ui.model.FilterOperator.Contains, sValue)
					], false);
				oEvent.getSource().getBinding("items").filter([oFilter]);
			},
			
			/**
			 * Account assignment object;
			 * close value help dialog
			 * @public
			 */
			onObjectValueHelpClose: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				//oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				var sObj = oSelectedItem.getTitle();
				sap.ui.getCore().byId("inpAccObject").setValue(sObj);
			},
			
			/**
			 * Account assignment object:
			 * factory of value help
			 * @public
			 */
			objectFactory: function (sId, oContext) {
				var sTitle = "";
				var sInfo = "";
				switch (this._sCategoryId) {
					case "A":
						sTitle = "MasterFixedAsset";
						sInfo = "FixedAsset";
						break;
					case "F":
						sTitle = "OrderID";
						sInfo = "OrderDescription";
						break;
					case "K":
						sTitle = "CostCenter";
						sInfo = "CostCenter_Text";
						break;
					case "Q":
						sTitle = "WBSElement";
						sInfo = "WBSDescription";
						break;
					// Fehlerkorrektur 8000003840 (Übernahme Kontierung Banf)
					case "P":
						sTitle = "WBSElement";
						sInfo = "WBSDescription";
						break;
				}
				
				return new sap.m.StandardListItem({
					title: "{accountobject>" + sTitle + "}",
					info:  "{accountobject>" + sInfo + "}"
				});
			},
			
			/**
			 * Order cart
			 * @public
			 */
			handleOrderCartPress: function (oEvent) {
				var oI18n = this.getView().getModel("i18n").getResourceBundle();
				var oCartItems = this._oMiniCartList.getItems();
				
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
					M.error(oI18n.getText("messageText"), {
						title: oI18n.getText("error"),
						details: sMessagetext,
						contentWidth: "100px",
						styleClass: sResponsivePaddingClasses
					});
				}
					
			},
			
			/**
			 * Post catalogs
			 */
			_postCatalogs: function(sPostUrl, oPayload) {
				return new Promise(
					function(resolve, reject) {
						var oUdsModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/USERDEFAULTS/");
						oUdsModel.create("/C_UserDefaultSettingItem" + sPostUrl, oPayload, {
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
				
				// Promise.all([ 
				// 			this._readAccountAssignmentObject(aPath[0]),
				// 			this._readAccountAssignmentObject(aPath[1]),
				// 			this._readAccountAssignmentObject(aPath[2])
				// 			]).then(that._evaluateAccountAssignmentObjects.bind(that),
				// 					that._handleDataError.bind(that));
				
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
					M.error(oI18n.getText("messageTextObj"), {
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
				M.show(sMessage, {
					title: oI18n.getText("serverError"),
					icon: sap.m.MessageBox.Icon.ERROR
				});
			}
			
		    
		//    showSearchByImageLinkIfImageBasedBuyingActive: function () {
		//        var t = this;
		//        var b = {
		//            success: function (r) {
		//                if (r) {
		//                    var i = r.IsScoped;
		//                    if (i) {
		//                        t.isImagebasedBuyingEnabled = true;
		//                        var s = t.getView().byId("searchByImage");
		//                        if (s) {
		//                            s.setVisible(true);
		//                        }
		//                    } else {
		//                        t.isImagebasedBuyingEnabled = false;
		//                    }
		//                }
		//            },
		//            error: function (e) {
		//            },
		//            urlParameters: { ScopeItem: "3UH" },
		//            method: "GET"
		//        };
		//        var m = this.getAppModel();
		//        m.callFunction("/CheckScopeStatus", b);
		//    },
		//    showUserDefaultPlantCompanyCodeForHub: function (u) {
		//        var b = this.getView().byId("userSettingText");
		//        var t;
		//        if (u) {
		//            var P = "/UserDefault";
		//            var c, d, e, g;
		//            var h = this;
		//            var i = {
		//                success: function (r) {
		//                    if (r) {
		//                        var U = r.GetUserOrgDefault;
		//                        if (U !== undefined || U !== null) {
		//                            c = U.Plant;
		//                            d = U.Plantname;
		//                            e = U.Companycode;
		//                            g = U.Companycodename;
		//                            if (c && d && e && g) {
		//                                t = h.getResourceBundle().getText("userSetting", [
		//                                    d,
		//                                    c,
		//                                    g,
		//                                    e
		//                                ]);
		//                                if (t) {
		//                                    b.setText(t);
		//                                    b.setVisible(true);
		//                                }
		//                            }
		//                            h.setUserDefaultSettings(U);
		//                            h.getView().byId("limitItemCreateBtn").setVisible(false);
		//                        }
		//                    }
		//                },
		//                error: function (j) {
		//                },
		//                urlParameters: { User: u },
		//                method: "GET"
		//            };
		//            var m = this.getAppModel();
		//            m.callFunction("/GetUserOrgDefault", i);
		//        }
		//    },
		//    genInfo: function () {
		//        this.bBusyIndicator = true;
		//        this.dataManager.getCurrentDraft(this.getServiceCallParameter(this.showUserPopup, this.serviceFail));
		//    },
		//    showUserPopup: function (d) {
		//        var t = this;
		//        this.bBusyIndicator = false;
		//        var h;
		//        var b = d.results ? d.results[0] : d;
		//        var c = this.getDraftKey(b, true);
		//        this.getView().byId("headerPanel").setBusy(true);
		//        if (b) {
		//            this.setExtScenarioFlag(b.IsExtPurgScenario);
		//            this.setPurchaseRequisitionType(b.PurchaseRequisitionType);
		//            this.hubEmployeeID = b.PurReqnSSPAuthor;
		//            if (b.NumberOfItems !== 0) {
		//                M.show(this.getResourceBundle().getText("draftMessage"), {
		//                    icon: M.Icon.INFORMATION,
		//                    title: t.getResourceBundle().getText("draft"),
		//                    actions: [
		//                        t.getResourceBundle().getText("continue"),
		//                        t.getResourceBundle().getText("discard")
		//                    ],
		//                    onClose: function (A) {
		//                        if (A === t.getResourceBundle().getText("continue")) {
		//                            t.getDraftSuccessCallback(d);
		//                        } else if (A === t.getResourceBundle().getText("discard")) {
		//                            t.deleteAndCreateNewDraft(c, b.PurchaseRequisition);
		//                        }
		//                        t.getView().setVisible(true);
		//                    },
		//                    initialFocus: t.getResourceBundle().getText("continue")
		//                });
		//            } else {
		//                this.deleteAndCreateNewDraft(c, b.PurchaseRequisition);
		//                this.getView().setVisible(true);
		//            }
		//        } else {
		//            this.getView().setVisible(true);
		//            this.getView().byId("searchItems").setVisible(false);
		//            this.getView().byId("searchByImage").setVisible(false);
		//            this.getView().byId("catalogText").setVisible(false);
		//            this.getView().byId("headerPanel").setBusy(true);
		//            sap.ui.getCore().getMessageManager().removeAllMessages();
		//            this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
		//        }
		//        var i = true;
		//        if (b && b.IsSrchEnabled) {
		//            i = false;
		//        }
		//        this.getView().byId("searchItems").setVisible(i);
		//        if (i && this.isImagebasedBuyingEnabled) {
		//            this.getView().byId("searchByImage").setVisible(true);
		//        } else {
		//            this.getView().byId("searchByImage").setVisible(false);
		//        }
		//        this.getView().byId("catalogText").setVisible(i);
		//    },
		//    success: function (d) {
		//        var b = d.results ? d.results[0] : d;
		//        var i = false;
		//        if (b) {
		//            if (b.IsSrchEnabled) {
		//                i = false;
		//            } else {
		//                i = true;
		//            }
		//            this.getView().byId("searchItems").setVisible(i);
		//            if (i && this.isImagebasedBuyingEnabled) {
		//                this.getView().byId("searchByImage").setVisible(true);
		//            } else {
		//                this.getView().byId("searchByImage").setVisible(false);
		//            }
		//            this.getView().byId("catalogText").setVisible(i);
		//        }
		//        var c = this.getDraftKey(b, true);
		//        this.setHeaderDraftKey(c);
		//        this.setPurchaseRequisition(b.PurchaseRequisition);
		//        this.bindMiniCart();
		//        this.view.setVisible(true);
		//        this.showCatalogList();
		//        this.getView().byId("headerPanel").setBusy(false);
		//        if (!this.bBusyIndicator) {
		//            this.getView().setBusy(false);
		//        }
		//    },
		//    createSuccessNewDraft: function (d) {
		//        if (d) {
		//            this.setExtScenarioFlag(d.IsExtPurgScenario);
		//            this.setPurchaseRequisitionType(d.PurchaseRequisitionType);
		//            this.success(d);
		//            if (this.getExtScenarioFlag()) {
		//                this.showUserDefaultPlantCompanyCodeForHub(this.hubEmployeeID);
		//            } else {
		//                this.getView().byId("limitItemCreateBtn").setVisible(true);
		//            }
		//            if (!this.bBusyIndicator) {
		//                this.getView().setBusy(false);
		//            }
		//        }
		//    },
		//    onSuccessCatalogFetch: function (d) {
		//        if (d) {
		//            this.onSuccessShowCatalogs(d);
		//            this.getView().setBusy(false);
		//        }
		//    },
		//    createSuccessCallback: function (d) {
		//        this.hubEmployeeID = d.PurReqnSSPAuthor;
		//        if (d.IsExtPurgScenario) {
		//            this.showUserDefaultPlantCompanyCodeForHub(this.hubEmployeeID);
		//        } else {
		//            this.getView().byId("limitItemCreateBtn").setVisible(true);
		//        }
		//        this.success(d);
		//        this.navToSourcePage();
		//    },
		//    deleteAndCreateNewDraft: function (d, b) {
		//        sap.ui.getCore().getMessageManager().removeAllMessages();
		//        this.dataManager.deleteAndCreateNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail), d, b, this.onSuccessCatalogFetch);
		//    },
		//    _handleRouteMatched: function () {
		//        this.clearMessages();
		//        var l = this.getView().byId("FilterList");
		//        var c = l.getSelectedContexts(true);
		//        if (this._oMiniCart) {
		//            this._oMiniCartList.unbindItems();
		//            this._oMiniCart.destroyContent();
		//            this._oMiniCart.destroy();
		//            this._oMiniCart = null;
		//        }
		//        if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
		//            this.setSourcePage("Search");
		//        }
		//        if (c.length) {
		//            this.filterListSelect(l);
		//        }
		//        var t = this;
		//        if (t.getOrderDelete() === true) {
		//            if (!this.getCopyScenarioFlag()) {
		//                t.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
		//            } else {
		//                t.getView().setBusy(true);
		//                t.genInfo();
		//                t.clearCopyScenarioFlag();
		//            }
		//            this.getView().byId("filterBtn").setType("Default").setVisible(false);
		//            this.oSplitContainer.setShowSecondaryContent(false);
		//            t.setOrderDelete(false);
		//        } else {
		//            if (t.getHeaderDraftKey()) {
		//                t.getView().setBusyIndicatorDelay(0);
		//                t.getView().setBusy(true);
		//                t.showCatalogList();
		//                t.dataManager.getHeader(t.getServiceCallParameter(t.createSuccessCallback, t.serviceFail), t.getHeaderDraftKey(), t.getPurchaseRequisition());
		//                var s = this.getView().byId("searchItems").getValue();
		//                if (s) {
		//                    this.filterListSelect(l);
		//                }
		//            } else {
		//                sap.ui.getCore().getMessageManager().removeAllMessages();
		//                this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
		//            }
		//        }
		//    },
		//    getDraftSuccessCallback: function (d) {
		//        var b = d.results ? d.results[0] : d;
		//        var c = this.getDraftKey(b, true);
		//        this.setHeaderDraftKey(c);
		//        this.setPurchaseRequisition(b.PurchaseRequisition);
		//        this.bindMiniCart();
		//        this.getView().byId("headerPanel").setBusy(false);
		//        this.showCatalogList();
		//        if (this.getExtScenarioFlag()) {
		//            this.showUserDefaultPlantCompanyCodeForHub(this.hubEmployeeID);
		//        } else {
		//            this.getView().byId("limitItemCreateBtn").setVisible(true);
		//        }
		//        this.getView().setBusy(false);
		//    },
		//    searchBtnPress: function (s) {
		//        var S = this.getView().byId("mySplitContainer");
		//        var F = this.getView().byId("flex");
		//        var b = this.getView().byId("searchItems").getValue();
		//        if (b) {
		//            var c = "ProductDescription eq '" + b + "'";
		//            var d = "ValueDesc eq '" + b + "'";
		//            this.searchResultBind(c);
		//        } else {
		//            this.getView().byId("middleContent").getAggregation("content")[0].bindElement("");
		//            var e = this.getResourceBundle().getText("SearchResults1", "0");
		//            var r = this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[0];
		//            r.setHeaderText(e);
		//        }
		//        if (S.getShowSecondaryContent() && s != false) {
		//            S.setShowSecondaryContent(false);
		//            F.setAlignItems("Start");
		//            F.setJustifyContent("Start");
		//            F.setHeight("30px");
		//        }
		//    },
		//    searchResultBind: function (s) {
		//        this.getView().byId("middleContent").setBusy(true);
		//        var m = this.getServiceCallParameter(this.onSuccessSearchBinding, this.serviceFail);
		//        this.dataManager.searchResultsBinding(m, s);
		//    },
		//    onSuccessSearchBinding: function (d) {
		//        this.getView().byId("middleContent").setBusy(false);
		//        this.getView().byId("catalogText").setEnabled(true);
		//        this.getView().setBusy(false);
		//        if (d.results.length) {
		//            this.destroyContent("middleContent");
		//            this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.SearchResults", "middleContent");
		//            var j = new sap.ui.model.json.JSONModel(d);
		//            this.getView().byId("middleContent").setModel(j);
		//            this.getView().byId("middleContent").getAggregation("content")[0].bindElement("/results");
		//            this.destroyContent("NoSearchresult");
		//            this.getView().byId("filterBtn").setVisible(true);
		//            var t = d.results.length;
		//            var b = this.getView().getModel("@i18n").getResourceBundle();
		//            var r = this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[0];
		//            r.setHeaderText(b.getText("SearchResults1", t));
		//            if (!this.getOwnerComponent().getComponentData().testMode) {
		//            }
		//        } else {
		//            this.destroyContent("middleContent");
		//            this.destroyContent("NoSearchresult");
		//            this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.NoserachResult", "NoSearchresult");
		//            this.getView().byId("filterBtn").setVisible(false);
		//            this.oSplitContainer.setShowSecondaryContent(false);
		//        }
		//    },
		//    filterResultBind: function (b) {
		//        var m = this.getServiceCallParameter(this.onSuccessFilterResult, this.serviceFail);
		//        this.dataManager.filterResultsBinding(m, b);
		//    },
		//    onSuccessFilterResult: function (d) {
		//        this.removeRawData(d);
		//        var t = this.cloneFilterData(d);
		//        this.saveFilterTemplate(t);
		//        var b = d.results.length;
		//        for (var i = 0; i < b; i++) {
		//            if (d.results[i].PropertyCategory === "Price Range") {
		//                d.results[i].PropertyCategory = "Z-Price Range";
		//            }
		//        }
		//        var j = new sap.ui.model.json.JSONModel();
		//        j.setData(d);
		//        this.getView().byId("FilterList").setModel(j);
		//        this.getView().byId("FilterList").bindElement("/results");
		//        this.getView().byId("FilterList").setBusy(false);
		//    },
		//    removeRawData: function (d) {
		//        for (var i = d.results.length - 1; i >= 0; i--) {
		//            if (d.results[i].PropertyCategory === "RAW_PRICE") {
		//                d.results.splice(i, 1);
		//            }
		//        }
		//    },
		//    cloneFilterData: function (o) {
		//        var c;
		//        if (null == o || "object" != typeof o) {
		//            return o;
		//        }
		//        if (o instanceof Date) {
		//            c = new Date();
		//            c.setTime(o.getTime());
		//            return c;
		//        }
		//        if (o instanceof Array) {
		//            c = [];
		//            for (var i = 0, l = o.length; i < l; i++) {
		//                c[i] = this.cloneFilterData(o[i]);
		//            }
		//            return c;
		//        }
		//        if (o instanceof Object) {
		//            c = {};
		//            for (var b in o) {
		//                if (o.hasOwnProperty(b)) {
		//                    c[b] = this.cloneFilterData(o[b]);
		//                }
		//            }
		//            return c;
		//        }
		//        throw new Error("Unable to copy obj! Its type isn't supported.");
		//    },
		//    saveFilterTemplate: function (t) {
		//        for (var i = 0; i < t.results.length; i++) {
		//            t.results[i].TotalHits = "";
		//        }
		//        this.firstFilterData = t;
		//    },
		//    onSelectionFilter: function (e) {
		//        var l = e.getSource();
		//        this.filterListSelect(l);
		//    },
		//    filterListSelect: function (l) {
		//        var c = l.getSelectedContexts(true);
		//        for (var i = 0; i < c.length; i++) {
		//            this.selectedkey = c[i].getObject().PropertyCategory;
		//            this.selectedValue = c[i].getObject().PropertyValue;
		//            this.pushToFilterValues(this.selectedkey, this.selectedValue);
		//        }
		//        var b = this.formQueryString();
		//        var s = this.getView().byId("searchItems").getValue();
		//        var d = "";
		//        if (b !== "") {
		//            var e = "DESCRIPTION" + "@@@" + s;
		//            d = this.appendToQueryString(e) + b;
		//            d = d.replace("Z-Price Range", "Price Range");
		//            this.searchResultBind(d);
		//            this.filterLaterBind(d);
		//        } else {
		//            var g = false;
		//            this.searchBtnPress(g);
		//        }
		//        this.filters = {};
		//    },
		//    pushToFilterValues: function (k, v) {
		//        if (this.filters[k] === undefined) {
		//            var b = [];
		//            b.push(v);
		//            this.filters[k] = b;
		//        } else {
		//            b = this.filters[k];
		//            if (b.indexOf(v) === -1) {
		//                b.push(v);
		//            }
		//            this.filters[k] = b;
		//        }
		//    },
		//    formQueryString: function () {
		//        var u = "";
		//        for (var k in this.filters) {
		//            var b = k;
		//            var c = this.filters[k];
		//            for (var i = 0; i < c.length; i++) {
		//                b = b + "@@@" + c[i];
		//            }
		//            u = u + " or " + this.appendToQueryString(b);
		//        }
		//        return u;
		//    },
		//    appendToQueryString: function (b) {
		//        return " OpnCtlgFilterValue eq '" + b + "'";
		//    },
		//    filterLaterBind: function (b) {
		//        var m = this.getServiceCallParameter(this.onSuccessAfterFilter, this.serviceFail);
		//        this.dataManager.filterResultsBinding(m, b);
		//    },
		//    onSuccessAfterFilter: function (d) {
		//        this.getView().byId("filterBtn").setVisible(true);
		//        this.oSplitContainer.setShowSecondaryContent(true);
		//        var b = this.processFilter(d);
		//        var c = b.results.length;
		//        for (var i = 0; i < c; i++) {
		//            if (b.results[i].PropertyCategory === "Price Range") {
		//                b.results[i].PropertyCategory = "Z-Price Range";
		//            }
		//        }
		//        this.getView().byId("FilterList").getModel().setData(b);
		//    },
		//    processFilter: function (n) {
		//        var o = this.cloneFilterData(this.firstFilterData);
		//        this.removeNewPriceRange(n);
		//        this.mappingNewPriceRange(o, n);
		//        for (var i = 0; i < n.results.length; i++) {
		//            for (var j = 0; j < o.results.length; j++) {
		//                if (o.results[j].PropertyCategory === n.results[i].PropertyCategory && o.results[j].ValueDesc === n.results[i].ValueDesc) {
		//                    o.results[j].TotalHits = n.results[i].TotalHits;
		//                }
		//            }
		//        }
		//        return o;
		//    },
		//    removeNewPriceRange: function (n) {
		//        for (var i = n.results.length - 1; i >= 0; i--) {
		//            if (n.results[i].PropertyCategory === "Price Range") {
		//                n.results.splice(i, 1);
		//            }
		//        }
		//    },
		//    mappingNewPriceRange: function (o, n) {
		//        var s = [];
		//        for (var i = 0; i < n.results.length; i++) {
		//            if (n.results[i].PropertyCategory === "RAW_PRICE") {
		//                for (var j = 0; j < o.results.length; j++) {
		//                    s = o.results[j].PropertyValue.split("-");
		//                    if (o.results[j].PropertyCategory === "Price Range") {
		//                        if (parseFloat(s[0]) <= parseFloat(n.results[i].PropertyValue) && parseFloat(n.results[i].PropertyValue) < parseFloat(s[1])) {
		//                            if (o.results[j].TotalHits === "" && o.results[j].TotalHits !== 0) {
		//                                o.results[j].TotalHits = 0;
		//                            }
		//                            o.results[j].TotalHits = parseInt(o.results[j].TotalHits) + parseInt(n.results[i].TotalHits);
		//                            break;
		//                        }
		//                    }
		//                }
		//            }
		//        }
		//    },
		//    showCatalogPress: function () {
		//        this.destroyContent("NoSearchresult");
		//        this.getView().byId("catalogText").setEnabled(false);
		//        this.getView().byId("filterBtn").setType("Default").setVisible(false);
		//        this.showCatalogList();
		//    },
		//    showCatalogList: function () {
		//        this.getView().byId("filterBtn").setVisible(false);
		//        this.oSplitContainer.setShowSecondaryContent(false);
		//        this.destroyContent("middleContent");
		//        this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList", "middleContent");
		//        this.bindCatalog("middleContent");
		//        var c = sap.ui.getCore().byId("catTable");
		//        var C = sap.ui.getCore().byId("catList");
		//        c.bindItems("/UserCatalogSet", C);
		//    },
		//    onSuccessShowCatalogs: function (d) {
		//        this.getView().byId("filterBtn").setVisible(false);
		//        this.oSplitContainer.setShowSecondaryContent(false);
		//        this.destroyContent("middleContent");
		//        this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList", "middleContent");
		//        this.bindCatalog("middleContent");
		//        var c = sap.ui.getCore().byId("catTable");
		//        var C = sap.ui.getCore().byId("catList");
		//        var b = new sap.ui.model.json.JSONModel();
		//        b.setData(d);
		//        c.setModel(b);
		//        c.bindItems("/results", C);
		//    },
		//    showGridCatalog: function () {
		//        this.destroyContent("middleContent");
		//        this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogGrid", "middleContent");
		//        this.bindCatalog("middleContent");
		//    },
		//    CatalogWindowImg: function (e) {
		//        var S = e.getSource().getParent().getAggregation("content")[1].getProperty("text");
		//        this.catalogPress(S);
		//    },
		//    onCatalogNavClick: function (e) {
		//        var S = e.getSource().getAggregation("cells")[1].getAggregation("items")[0].getText();
		//        this.catalogPress(S);
		//    },
		//    onPressText: function (e) {
		//        var S = e.getSource().getText();
		//        this.catalogPress(S);
		//    },
		//    catalogPress: function (S) {
		//        var b = this.getHeaderDraftKey();
		//        var m = this.getServiceCallParameter(this.onSuccessGetUrl, this.serviceFail);
		//        this.dataManager.catalogBind(m, S, b);
		//    },
		//    onSuccessGetUrl: function (d) {
		//        this.oneTimePoll = true;
		//        var t = this;
		//        var s = d.ServiceURL;
		//        var b;
		//        if (d.FormData) {
		//            b = $("<form/>");
		//            b.attr("method", "post");
		//            b.attr("action", s);
		//            b.attr("target", "catalogWindow");
		//            var q = d.FormData.split("&");
		//            for (var i = 0; i < q.length; i++) {
		//                this.nameValuePair = q[i].split("=");
		//                var c = $("<input>").attr({
		//                    type: "hidden",
		//                    name: this.nameValuePair[0],
		//                    value: this.nameValuePair[1]
		//                });
		//                b.append(c);
		//                b.appendTo(document.body);
		//            }
		//        }
		//        var e = "/PollingSet(EventId='" + d.EventId + "')";
		//        this.pollingAllowed = true;
		//        var P = {
		//            "success": jQuery.proxy(t.onSuccesspolling, this),
		//            "error": jQuery.proxy(t.errorServiceFail, this)
		//        };
		//        t.oModel.read(e, P);
		//        p = window.open("", "catalogWindow", "height=800,width=1100,resizable=yes,scrollbars=1");
		//        p.opener = null;
		//        if (p.location == "about:blank") {
		//            p.location = s;
		//        }
		//        if (d.FormData) {
		//            b.submit();
		//            document.body.removeChild(b);
		//        }
		//        p.focus();
		//    },
		//    onSuccesspolling: function (d) {
		//        var t = this;
		//        if (d.Status === "001") {
		//            if (this.pollingAllowed) {
		//                var b = "/PollingSet(EventId='" + d.EventId + "')";
		//                var P = {
		//                    "success": jQuery.proxy(this.onSuccesspolling, this),
		//                    "error": jQuery.proxy(this.errorServiceFail, this)
		//                };
		//                setTimeout(function () {
		//                    t.oModel.read(b, P);
		//                    if (!p.closed) {
		//                        t.pollingAllowed = true;
		//                    } else {
		//                        if (t.oneTimePoll == true) {
		//                            t.oneTimePoll = false;
		//                            t.pollingAllowed = true;
		//                        } else {
		//                            t.pollingAllowed = false;
		//                        }
		//                    }
		//                }, 1000);
		//            }
		//        }
		//        if (d.Status === "002") {
		//            sap.m.MessageToast.show(this.getResourceBundle().getText("Incomplete"));
		//            this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback, this.serviceFail), this.getHeaderDraftKey(), this.getPurchaseRequisition());
		//        }
		//        if (d.Status === "003") {
		//            sap.m.MessageToast.show(this.getResourceBundle().getText("Failure"));
		//        }
		//        if (d.Status === "004") {
		//            sap.m.MessageToast.show(this.getResourceBundle().getText("Success"));
		//            this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback, this.serviceFail), this.getHeaderDraftKey(), this.getPurchaseRequisition());
		//        }
		//    },
		//    onSortReview: function () {
		//        var t = this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[1].getBinding("items");
		//        var l = t.oList;
		//        if (this.bDescending) {
		//            this.bDescending = false;
		//        } else {
		//            this.bDescending = true;
		//        }
		//        for (var k in l) {
		//            l[k].OpnCtlgPrcAmountInComCurrency = parseFloat(l[k].OpnCtlgPrcAmountInComCurrency);
		//        }
		//        var s = [];
		//        s.push(new sap.ui.model.Sorter("OpnCtlgPrcAmountInComCurrency", this.bDescending));
		//        t.sort(s);
		//    },
		//    onExit: function () {
		//        if (this._oPopover) {
		//            this._oPopover.destroy();
		//        }
		//        if (this._oPopoverFilter) {
		//            this._oPopoverFilter.destroy();
		//        }
		//    },
		//    ProductDetails: function (e) {
		//        this.setSearchterm("false");
		//        var F = this.getView().byId("flex");
		//        var P = e.getSource().getBindingContext().getPath().substr(9);
		//        var o = e.getSource().getBindingContext().getModel().getData().results[P].OpnCtlgItemID;
		//        var l = e.getSource().getBindingContext().getModel().getData().results[P].Language;
		//        var c = e.getSource().getBindingContext().getModel().getData().results[P].OpnCtlgWebServiceID;
		//        var d = this.getHeaderDraftKey();
		//        var C = sap.ui.getCore().getConfiguration().getLanguage();
		//        if (!l) {
		//            l = C;
		//        }
		//        var b = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.dataManager.EntityConstants.DUMMY_PR_KEY;
		//        this.getRouter().navTo("ProductDetails", {
		//            OpnCtlgItemID: o,
		//            OpnCtlgWebServiceID: c,
		//            view: "search",
		//            DraftKey: d,
		//            PurchaseRequisition: b,
		//            free: "0",
		//            Language: l
		//        });
		//        if (this._oMiniCart) {
		//            this._oMiniCartList.unbindItems();
		//            this._oMiniCart.destroyContent();
		//            this._oMiniCart.destroy();
		//            this._oMiniCart = null;
		//        }
		//        F.setAlignItems("Start");
		//        F.setJustifyContent("Start");
		//        F.setHeight("30px");
		//    },
		//    closeSecondaryContent: function (e) {
		//        var s = this.getView().byId("mySplitContainer");
		//        s.setShowSecondaryContent(!s.getShowSecondaryContent());
		//        var F = this.getView().byId("flex");
		//        if (s.getShowSecondaryContent()) {
		//            e.getSource().setType("Emphasized");
		//            F.setAlignItems("Start");
		//            F.setJustifyContent("End");
		//            F.setHeight("30px");
		//            var b = this.getView().byId("searchItems").getValue();
		//            if (b) {
		//                this.getView().byId("FilterList").setBusy(true);
		//                var c = "ValueDesc eq '" + b + "'";
		//                this.filterResultBind(c);
		//            } else {
		//                this.getView().byId("FilterList").bindElement("");
		//            }
		//        } else {
		//            e.getSource().setType("Default");
		//            F.setAlignItems("Start");
		//            F.setJustifyContent("Start");
		//            F.setHeight("30px");
		//        }
		//    },
		//    addToCart: function (e) {
		//        var b = e.getSource().getBindingContext().getPath().substr(9);
		//        var r = e.getSource().getBindingContext().getModel().oData.results[b].OpnCtlgMinOrderQuantity;
		//        if (isNaN(Number(r))) {
		//            r = Number(parseFloat(sap.ui.core.format.NumberFormat.getFloatInstance().parse(r)));
		//            r = String(r);
		//        }
		//        var m = sap.ui.getCore().getMessageManager();
		//        var o = new sap.ui.core.message.ControlMessageProcessor();
		//        var s = this.getResourceBundle().getText("MESSAGE_ERROR_ADDTOCART");
		//        var t = "/" + r + "/value";
		//        var d = new sap.ui.core.message.Message({
		//            message: s,
		//            type: sap.ui.core.MessageType.Error,
		//            target: t,
		//            processor: o
		//        });
		//        m.registerMessageProcessor(o);
		//        if (r > 0 && r.match(/^[0-9]{1,10}(\.\d{1,3})?$/i)) {
		//            var D = {
		//                RequestedQuantity: r,
		//                PurchaseRequisition: this.getPurchaseRequisition(),
		//                ParentDraftUUID: this.getHeaderDraftKey(),
		//                PurReqnSSPCrossCatalogItem: e.getSource().getBindingContext().getObject().OpnCtlgItemID
		//            };
		//            this.getView().setBusy(true);
		//            var P = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
		//            this.dataManager.createNewItem(P, this.getHeaderDraftKey(), this.getPurchaseRequisition(), D);
		//            return true;
		//        } else {
		//            m.addMessages(d);
		//            sap.m.MessageToast.show(this.getResourceBundle().getText("MESSAGE_ERROR_ADDTOCART"));
		//            e.getSource().getParent().getParent().getAggregation("items")[0].getAggregation("items")[1].getAggregation("items")[0].setValueState(sap.ui.core.ValueState.Error);
		//            var c = this.getView().byId("MsgalrtBtn");
		//            c.firePress();
		//            return false;
		//        }
		//    },
		//    successhandleAddtoCartPress: function () {
		//        var m = sap.ui.getCore().getMessageManager();
		//        var b = m.getMessageModel().getData();
		//        var c = -1;
		//        for (var i = 0; i < b.length; i++) {
		//            if (b[i].message && b[i].code === "MMPUR_REQ_COMMON/022") {
		//                sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCartUpdated"));
		//                c = 1;
		//                break;
		//            } else {
		//                c = 0;
		//            }
		//        }
		//        if (c !== 1) {
		//            sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
		//        }
		//        this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback, this.serviceFail), this.getHeaderDraftKey(), this.getPurchaseRequisition());
		//    },
		//    successCallback: function (d) {
		//        var b = d.results ? d.results[0] : d;
		//        var c = this.getDraftKey(b, true);
		//        this.setHeaderDraftKey(c);
		//        this.setPurchaseRequisition(b.PurchaseRequisition);
		//        this.bindMiniCart();
		//        this.getView().byId("headerPanel").setBusy(false);
		//        this.getView().setBusy(false);
		//        var e = this.getView().byId("btnCart");
		//        e.firePress();
		//    },
		//    PricescaleClick: function (e) {
		//        var s = e.getSource();
		//        if (!this._prcsclPopover) {
		//            var t = this;
		//            Fragment.load({
		//                name: "ui.s2p.mm.requisition.maintain.s1.view.PriceRange",
		//                controller: this
		//            }).then(function (d) {
		//                t._prcsclPopover = d;
		//                t.view.addDependent(t._prcsclPopover);
		//                t.priceScaleFind(s);
		//            });
		//        } else {
		//            this.priceScaleFind(s);
		//        }
		//    },
		//    priceScaleFind: function (s) {
		//        var b = "OpnCtlgItemID eq " + s.getParent().getParent().getBindingContext().getObject().OpnCtlgItemID;
		//        var q = s.getParent().getParent().getItems()[0].getItems()[1].getProperty("text");
		//        this.curr = " " + s.getParent().getParent().getItems()[0].getItems()[0].getProperty("unit");
		//        q = this.getResourceBundle().getText("price") + " " + q;
		//        var m = this.getServiceCallParameter(this.successPrcScale, this.serviceFail);
		//        this.dataManager.priceScalefind(m, b);
		//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._prcsclPopover);
		//        jQuery.sap.delayedCall(0, this, function () {
		//            this._prcsclPopover.openBy(s);
		//        });
		//        this._prcsclPopover.getAggregation("content")[0].getAggregation("columns")[1].getAggregation("header").setText(q);
		//    },
		//    successPrcScale: function (d) {
		//        var j = new sap.ui.model.json.JSONModel(d);
		//        var l = j.oData.results.length;
		//        var i = 0;
		//        for (i = 0; i < l; i++) {
		//            j.oData.results[i].Currency = this.curr;
		//        }
		//        this._prcsclPopover.getContent()[0].setModel(j);
		//        this._prcsclPopover.getContent()[0].bindElement("/results");
		//    },
		//    onBack: function () {
		//        if (this.getCopyScenarioFlag()) {
		//            this.clearCopyScenarioFlag();
		//        }
		//        var h = H.getInstance();
		//        var P = h.getPreviousHash();
		//        if (P !== undefined) {
		//            window.history.go(-1);
		//        } else {
		//            var c = sap.ushell.Container.getService("CrossApplicationNavigation");
		//            c.toExternal({ target: { shellHash: "#" } });
		//        }
		//    },
		//    onPressDefault: function () {
		//        var c = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		//        c.toExternal({
		//            target: {
		//                semanticObject: "UserDefaults",
		//                action: "manage"
		//            },
		//            params: { BusinessObject: "PR" }
		//        });
		//    },
		//    fnTypeMismatch: function (e) {
		//        M.error(this.getResourceBundle().getText("imageTypeMismatch1"));
		//    },
		//    fnBeforeUpload: function (e) {
		//        this.getView().setBusy(true);
		//        this.uploadedFileName = e.getParameter("fileName");
		//        this.oDataModel = this.getAppModel();
		//        var h = {
		//            name: "slug",
		//            value: this.uploadedFileName
		//        };
		//        e.getParameters().requestHeaders.push(h);
		//        e.getParameters().requestHeaders.push({
		//            name: "x-csrf-token",
		//            value: this.oDataModel.getSecurityToken()
		//        });
		//    },
		//    fnUploadComplete: function (e) {
		//        if (e.getParameter("status") === 200 || e.getParameter("status") === 201) {
		//            var s = e.getParameter("response").split("Response-")[1];
		//            var b = e.getParameter("response").split("Status-")[1].substring(0, 3);
		//            if (b === "200" || b === "201") {
		//                if (s.includes("RESULT")) {
		//                    var c = JSON.parse(s);
		//                }
		//                if (c) {
		//                    this.fnCatalogItemsByIDForAlphaVersion(c);
		//                }
		//            } else {
		//                this.getView().setBusy(false);
		//                M.error(s);
		//            }
		//        } else {
		//            this.getView().setBusy(false);
		//            M.error(this.getResourceBundle().getText("errorOccured1"));
		//        }
		//    },
		//    fnCatalogItemsByIDForAlphaVersion: function (b) {
		//        var F = [];
		//        var i = [];
		//        if (b && b.RESULT) {
		//            var c = b.RESULT;
		//            for (var d = 0; d < c.length; d++) {
		//                if (i.indexOf(c[d]) === -1) {
		//                    i.push(c[d]);
		//                }
		//            }
		//        }
		//        if (i.length > 0) {
		//            for (d = 0; d < i.length; d++) {
		//                F.push(new sap.ui.model.Filter("OpnCtlgItemID", "EQ", i[d]));
		//            }
		//            var t = this;
		//            var e = {
		//                filters: F,
		//                success: function (D, r) {
		//                    t.onSuccessSearchBinding(D);
		//                },
		//                error: function (o) {
		//                    var D = {};
		//                    D.results = [];
		//                    this.onSuccessSearchBinding(D, true);
		//                }
		//            };
		//            this.oModel = this.getAppModel();
		//            var h = { isFuzzy: false };
		//            this.oModel.setHeaders(h);
		//            this.oModel.read("/C_Procurementitems", e);
		//            var g = {
		//                filters: F,
		//                success: function (D, r) {
		//                    t.onSuccessFilterResult(D);
		//                },
		//                error: function (o) {
		//                    var D = {};
		//                    D.results = [];
		//                    this.onSuccessFilterResult(D, true);
		//                }
		//            };
		//            this.oModel.read("/SearchFilterSet", g);
		//        } else {
		//            var D = {};
		//            D.results = [];
		//            this.onSuccessSearchBinding(D, true);
		//        }
		//    },
		//    fnFileSizeExceeded: function (e) {
		//        M.error(this.getResourceBundle().getText("fileSizeErrorMessage"));
		//    }
	});
});