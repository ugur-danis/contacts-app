sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/m/MessageBox',
], function (Controller, History, MessageBox) {
	return Controller.extend("com.ContactsApp.Application.Base.BaseController", {
		showBusyIndicator: function (createId, iDelay = 0) { /* delay in miliseconds, */
			if (createId) {
				var multiInput = sap.ui.getCore().byId(createId);
				if (!multiInput) {
					multiInput = this.byId(createId);
					if (!multiInput) return console.warn(createId, "bulunamadı.");
				}
				multiInput.setBusyIndicatorDelay(iDelay);
				multiInput.setBusy(true);
			} else sap.ui.core.BusyIndicator.show(iDelay);
		},
		hideBusyIndicator: function (createId) {
			if (createId) {
				var multiInput = sap.ui.getCore().byId(createId);
				if (!multiInput) {
					multiInput = this.byId(createId);
					if (!multiInput) return console.warn(createId, "bulunamadı.");
				}
				multiInput.setBusy(false);
			} else sap.ui.core.BusyIndicator.hide();
		},
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("Dashboard", {}, true /*no history*/);
			}
		},
		/**
		 * 
		 * @param {String} name route name
		 * @param {Object} parameters route parametreleri
		 * @param {Boolean} replace tarayıcı geçmişi ayarı. true ise tarayıcı geçmişi olmadan
		 */
		navTo: function (name, parameters = {}, replace = false) {
			this.getOwnerComponent().getRouter().navTo(name, parameters, replace);
		},
		getMockData: function (fileName) {
			return new Promise(function (resolve, reject) {
				$.ajax("/Resources/mockdata/" + fileName + ".json", {
					dataType: "json",
					success: function (oData) {
						resolve(oData);
					},
					error: function () {
						reject("failed to load json")
					}
				})
			})
		},
		/**
		 * tabloda geçersiz filtre yapılması durumunda tablodaki tüm filteyi temizleyen event
		 * @param {Object} oEvent 
		 */
		clearAllTableFilters: function (oEvent) {
			oEvent.getSource().getParent().getBinding("rows").filter([]);
			oEvent.getSource().getParent().getColumns().forEach(col => {
				col.setFiltered(false)
				col.setFilterValue()
			})
		},
		/**
		 * enum şeklinde gelen verinin formatterı
		 * @param {Object[]} list veri listesi
		 * @param {String} key veri listesindeki formatlanacak field
		 * @param {String} sPath indexlenecek enum listesinin model pathi
		 * @param {String} iteratee enum listesinin index keyi
		 * @param {String} propertyKey enum listesinin alınacak fieldi 
		 */
		formatValues: function (list = [], key, sPath, iteratee, propertyKey) {
			var enumList = _.indexBy(oModel.getProperty(sPath), iteratee)
			list.forEach(d => {
				var data = d[key]
				var findedEnum = enumList[data]
				var formattedData = findedEnum ? findedEnum[propertyKey] : data
				d[key + 'TX'] = d[key + 'TX'] || formattedData
			})
			return list;
		},
		/** datetime şeklinde gelen verinin tarih-saat şeklinde formatterı */
		formatDateTime: function (value) {
			return moment(value, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm:ss")
		},
		/** datetime şeklinde gelen verinin tarih şeklinde formatterı */
		formatDate: function (value) {
			return moment(value, "YYYY-MM-DD").format("DD.MM.YYYY")
		},
		/**
		 * 
		 * @param {Array} tree 
		 * @param {String} childNode ağaç hangi düğümle bağlı? 
		 */
		solveTree: function (tree, childNode) {   /** tree verisini tek array e çevirir */
			const solvedList = [];

			tree.forEach(branch => {
				const element = Object.assign({}, branch);
				delete element[childNode]
				if (branch[childNode].length > 0) {
					solvedList.push(element)
					solvedList.push(...this.solveTree(branch[childNode], childNode));
				} else {
					solvedList.push(element);
				}
			});

			return solvedList;
		},
		/**
		 * inputların livechange ve manuel check eventı
		 * @param {Object} oEvent fonksiyonu manuel çağırırken "" gönderilir
		 * @param {String} inputId 
		 * @param {String} regexp farklı bir regexp kontrolü için, isteğe bağlı
		 * @param {String} errorText farklı bir hata mesajı için, isteğe bağlı
		 */
		liveValidateValue: function (oEvent, inputId, regexp, errorText) {
			var input = inputId ? this.byId(inputId) || sap.ui.getCore().byId(inputId) : oEvent.getSource()
			var value = input.getValue()
			var maxLength = input.getMaxLength() || 30
			errorText = errorText || "Lütfen en az 2 karakterden oluşan bir değer girin."

			if (value && value.trim()) {
				if (this.valueRegexpControl(value, regexp, maxLength)) {
					input.setValueState("None")
				} else {
					input.setValueState("Error")
					input.setValueStateText(errorText)
				}
			} else if (input.getRequired()) {
				input.setValueState("Error")
				input.setValueStateText("Bu alanın doldurulması zorunludur.")
			} else {
				//value boş, required değil
				input.setValueState("None")
			}
		},
		valueRegexpControl: function (value, regexp, maxLength) {
			regexp = regexp || "^[a-zA-ZwığüşöçĞÜŞÖÇİ0-9. ]{2," + maxLength + "}$"
			regexp = new RegExp(regexp)
			return regexp.test(value)
		},
		/**
		 * selectbox ların change eventi
		 * @param {*} oEvent 
		 * @param {*} inputId 
		 */
		changeValidate: function (oEvent, inputId, errorText) {
			var input = inputId ? this.byId(inputId) || sap.ui.getCore().byId(inputId) : oEvent.getSource()
			var [, , elementName] = input.getMetadata().getElementName().split('.')

			switch (elementName) {
				case "MultiComboBox":
					var value = input.getSelectedItems()
					break;
				case "ComboBox":
				case "Select":
					var value = input.getSelectedItem() ? [input.getSelectedItem()] : []
					break;
			}
			errorText = errorText || "Bu alanın seçilmesi zorunludur."

			if (value && value.length) {
				input.setValueState("None")
				return true
			} else {
				input.setValueState("Error")
				input.setValueStateText("Bu alanın seçilmesi zorunludur.")
				return false
			}
		},
		/**
		 * mail inputlarının onsapfocusleave ve livechange eventi
		 * @param {String} inputId 
		 */
		liveValidateMail: function (inputId) {
			var regexp = "^[a-z0-9][-a-z0-9._]+@([-a-z]+[.])+[a-z]{2,4}$"
			var errorText = "E-posta adresiniz yalnızca harf, sayı, nokta (.), kısa çizgi (-), ve alt çizgi (_) içerebilir."
			this.liveValidateValue("", inputId, regexp, errorText);
		},
		validateDate: function (oEvent, inputId, errorText) {
			var input = inputId ? this.byId(inputId) || sap.ui.getCore().byId(inputId) : oEvent.getSource()
			var value = input.getValue()
			var valid = input.isValidValue()
			errorText = errorText || "Lütfen geçerli bir tarih girin."

			if (value) {
				if (valid) {
					input.setValueState("None")
				} else {
					input.setValueState("Error")
					input.setValueStateText(errorText)
				}
			} else if (input.getRequired()) {
				input.setValueState("Error")
				input.setValueStateText("Bu alanın doldurulması zorunludur.")
			} else {
				//value boş, required değil
				input.setValueState("None")
			}
		},
		/**
		 * mask inputların change ve manuel check eventi
		 * @param {*} oEvent 
		 * @param {*} inputId 
		 * @param {*} errorText farklı bir hata mesajı için, isteğe bağlı
		 */
		liveValidateGSM: function (oEvent, inputId, errorText) {
			var input = inputId ? this.byId(inputId) || sap.ui.getCore().byId(inputId) : oEvent.getSource()
			var value = input.getValue()
			errorText = errorText || "Lütfen geçerli bir telefon numarası girin."

			if ((value && value.search("_") == -1) || (!value && !input.getRequired())) {
				input.setValueState("None")
			} else {
				input.setValueState("Error")
				input.setValueStateText(errorText)
			}
		},
		replaceGSM: function (gsm) {
			if (gsm) {
				gsm = gsm.replace("(", "")
				gsm = gsm.replace(")", "")
				gsm = gsm.replace(" ", "")
				gsm = gsm.replace(" ", "")
			}
			return gsm || "";
		},
		formatGSM: function (gsm) {
			if (gsm) {
				let cleaned = gsm.replace(/\D/g, '');
				let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
				if (match) gsm = '(' + match[1] + ') ' + match[2] + '-' + match[3]
			}
			return gsm
		},
		/**
		 * 'Error' durumunda input olup olmaması kontrolü
		 * @param {Array} inputs 
		 */
		getInputsState: function (inputs) {
			var state = false;
			if (inputs && inputs.length) {
				state = inputs.every(id => {
					var input = this.byId(id) || sap.ui.getCore().byId(id)
					if (input.getValueState() == "Error") return false
					else return true
				})
			}
			return state;
		},
		/**
		 * id'leri gönderilen input statelerinin none durumuna çekilmesi
		 * @param {Array} inputs input id list
		 */
		clearInputsState: function (inputs) {
			if (inputs && inputs.length) {
				inputs.forEach(id => {
					var input = this.byId(id) || sap.ui.getCore().byId(id)
					input.setValueState("None")
				});
			}
		},
		bugNotifier: function (error) {
			MessageBox.error("Beklenmedik bir hata oluştu.", {
				details: error,
			})
			throw error
		},
		/**
		 * tüm value'lar trim ediliyor
		 * @param {Object} model 
		 */
		trimValues: function (model) {
			for (let key in model) {
				if (typeof (model[key]) == "string") model[key] = model[key].trim()
			}
			return model
		},
		getConfirmDelete: function (title) {
			return new Promise(function (resolve) {
				MessageBox.confirm(title + " silinecektir. Onaylıyor musunuz?", {
					onClose: function (oAction) {
						if (oAction == "OK") resolve(true);
					}
				})
			})
		},
		/**
		 * multiInput filterları için *varsa* seçili token verilerini döner, yoksa boş key oluşturmaz
		 * @param {Object} filters tüm filtrelerin tutulduğu obje
		 * @param {*} inputId multiInput idsi
		 * @param {*} key filtreye hangi key ile eklenecek
		 */
		getMultiInputValues: function (filters, inputId, key) {
			var values = this.byId(inputId).getTokens().map(token => token.getProperty("key"))
			if (values.length) filters[key] = values

			return filters;
		},
		/**
		 * string olarak gelen dosya içeriğinden blob file oluşturup indirtiliyor
		 * @param {String} blob blob document 
		 * @param {String} name 
		 * @param {String} fileType 
		 */
		saveFile: function (blob, name, type) {
			var element = document.createElement('a');

			var element = document.createElement('a');
			var blob = new Blob([blob], { type: 'application/' + type });

			element.setAttribute('href', window.URL.createObjectURL(blob));
			window.URL.revokeObjectURL(blob)
			element.setAttribute('download', name + "." + type);

			element.dataset.downloadurl = ['text/plain', element.download, element.href].join(':');
			element.draggable = true;
			element.classList.add('dragout');

			element.click();
		},
		/**
		 * view'daki tüm nesneler gizleniyor
		 * @param {Object[]} elementIds gizlenecek nesne id listesi
		 */
		hideAllElements: function (elementIds) {
			elementIds.forEach(id => this.byId(id).setVisible(false))
		},
		/**
		 * view'da gizli olan nesneler arasında istenilen nesne görünür kılınıyor
		 * @param {Object[]} displayedElementIds görüntülenecek nesne id listesi
		 */
		showElementByIds: function (displayedElementIds) {
			displayedElementIds.forEach(id => this.byId(id).setVisible(true))
		},
		/**
		 * MultiComboBox nesnelerinin yanındaki tümünü seç/kaldır butonunun fonksiyonu
		 * view'de press'ine bu fonksiyon verilip, 
		 * app:comboId özelliğine de MultiComboBox'un id si yazılmalı.
		 * @param {Object} oEvent 
		 */
		onToggleSelectedItems: function (oEvent) {
			var icon = oEvent.getSource().getIcon()
			var comboId = oEvent.getSource().data("comboId")
			var combo = this.byId(comboId)
			if (icon == "sap-icon://multiselect-all") {
				var items = combo.getItems()
				combo.setSelectedItems(items)
			} else {
				combo.setSelectedItems()
			}
		},
		/**
		 * 
		 * @param {Number} bytes 
		 */
		getBytes: function (bytes) {
			if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
			else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
			else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
			else if (bytes > 1) { bytes = bytes + " bytes"; }
			else if (bytes == 1) { bytes = bytes + " byte"; }
			else { bytes = "0 bytes"; }
			return bytes;
		},
		/**
		 * 
		 * @param {Object} args input'un text propertyleri
		 * @param {String} inputId validatore ait input'un idsi
		 */
		filterInputValidator: function (args, inputId) {
			var input = this.byId(inputId)
			var text = args.text;
			if (text.length != input.getMaxLength()) {
				sap.m.MessageToast.show('Lütfen ' + input.getMaxLength() + ' karakterden oluşan bir değer girin.')
				return null;
			} else {
				return new sap.m.Token({ key: text, text: text });
			}
		},
		/**
		 * object türündeki filtreleri query string'e çevirir
		 * @param {Object} filter filter values
		 * @param {Object} operators EQ (=) dışında operatorleri belirtmek için. Örn: { 'Begdt' : '<'}
		 */
		getQuery: function (filter, operations = {}) {
			var query = "&"
			for (let field in filter) {
				if (filter[field]) {
					var op = operations[field] || "="
					query += field + op + filter[field] + "&"
				}
			}

			return query;
		},
		/**
		 * selectDto kavramına uygun Filter sonucu üretir
		 * @param {String} query query string
		 * @param {String} group 
		 * @param {String} conversion 
		 */
		urlParse: function (query, group, conversion) {
			if (!query) return "";

			var params = query.split("&")
			return params.map(row => {
				var operators = {
					"=": "EQ",
					"<": "LT",
					">": "GT",
					"%": "CT",
					"!": "N"
				}
				for (let op in operators) {
					if (row.includes(op)) {
						var [field, value] = row.split(op)

						var filter = {
							PropertyName: field,
							Operation: operators[op],
							PropertyValue: value
						}

						if (op == "=" && value.includes(",")) filter.Operation = "IN"

						if (group) filter.Group = group;
						if (conversion) filter.ConversionMethodName = conversion;

						return filter;
					}
				}

			}).filter(f => f)
		},
		/**
		 * @param {String} type;
		 * yesterday, today, tomorrow, 
		 * lastWeek, currentWeek, nextWeek, 
		 * lastMonth, currentMonth, nextMonth, 
		 * lastYear, currentYear, nextYear
		 * @param {String} format 
		 */
		getDateRange: function (type, format) {
			format = format || "YYYY.MM.DD"
			var today = new Date(),
				begdt, enddt;
			switch (type) {
				/* Dün */
				case "yesterday":
					begdt = moment(today).add(-1, 'days');
					enddt = moment(today).add(-1, 'days');
					break;
				/* Bugün */
				case "today":
					begdt = moment(today);
					enddt = moment(today);
					break;
				/* Yarın */
				case "tomorrow":
					begdt = moment(today).add(1, 'days');
					enddt = moment(today).add(1, 'days');
					break;
				/* Geçen Hafta */
				case "lastWeek":
					begdt = moment(today).add(-1, 'weeks').startOf('isoWeek');
					enddt = moment(today).add(-1, 'weeks').endOf('isoWeek');
					break;
				/* Cari Hafta */
				case "currentWeek":
					begdt = moment(today).startOf('isoWeek');
					enddt = moment(today).endOf('isoWeek');
					break;
				/* Gelecek Hafta */
				case "nextWeek":
					begdt = moment(today).add(1, 'weeks').startOf('isoWeek');
					enddt = moment(today).add(1, 'weeks').endOf('isoWeek');
					break;
				/* Geçen Ay */
				case "lastMonth":
					begdt = moment(today).add(-1, 'month').startOf('month');
					enddt = moment(today).add(-1, 'month').endOf('month');
					break;
				/* Cari Ay */
				case "currentMonth":
					begdt = moment(today).startOf('month');
					enddt = moment(today).endOf('month');
					break;
				/* Gelecek Ay */
				case "nextMonth":
					begdt = moment(today).add(1, 'month').startOf('month');
					enddt = moment(today).add(1, 'month').endOf('month');
					break;
				/* Geçen Yıl */
				case "lastYear":
					begdt = moment(today).add(-1, 'year').startOf('year');
					enddt = moment(today).add(-1, 'year').endOf('year');
					break;
				/* Cari Yıl */
				case "currentYear":
					begdt = moment(today).startOf('year');
					enddt = moment(today).endOf('year');
					break;
				/* Gelecek Yıl */
				case "nextYear":
					begdt = moment(today).add(1, 'year').startOf('year');
					enddt = moment(today).add(1, 'year').endOf('year');
					break;
			}
			begdt = begdt.format(format);
			enddt = enddt.format(format);
			return { begdt, enddt };
		},
	});
}, true)