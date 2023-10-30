(function () {
    function SKU(wrap) {
        this.wrap = $(wrap);
        this.attrs = {};
        this.skuAttributes = JSON.parse($('.sku_attributes').val());
        this.uploadUrl = $('.upload_url').val();
        this.deleteUrl = $('.delete_url').val();
        this.attrIndex = 0;
        this.currentAttributeValue = [];
        this.currentSkuId = '';
        this.skuAttr = {};
        this.selectAttr = [];
        this.showPicName = '';
        this.init();
    }

    SKU.prototype.init = function () {
        let _this = this;
        // 绑定属性值添加事件
        _this.wrap.find('.sku_attr_key_val').on('click', '.Js_add_attr_val', function () {
            let html = '<div class="sku_attr_val_item">' +
                '<div class="sku_attr_val_input">' +
                '<input type="text" class="form-control">' +
                '</div>' +
                '<span class="btn btn-default Js_remove_attr_val"><i class="feather icon-x"></i></span>' +
                '</div>';
            $(this).before(html);
        });

        // 绑定属性值移除事件
        _this.wrap.find('.sku_attr_key_val').on('click', '.Js_remove_attr_val', function () {
            $(this).parent('.sku_attr_val_item').remove();
            _this.getSkuAttr();
        });

        // 选择属性触发
        _this.wrap.find('.sku_attr_key_val').on('change', '.attribute_selector', function () {
            if ($(this).val() != 'input') {
                let skuAttributesArray = _this.skuAttributes;
                _this.attrIndex = $(this).find("option:selected").data('idx');
                _this.skuAttr = skuAttributesArray[_this.attrIndex];
            }
            _this.changeAttrValueHtml($(this), $(this).val());
        });

        // 绑定添加属性名事件
        _this.wrap.find('.Js_add_attr_name').click(function () {
            _this.wrap.find('.sku_attr_key_val tbody').append(_this.getHtml())
        });

        // 绑定移除属性名事件
        _this.wrap.find('.sku_attr_key_val').on('click', '.Js_remove_attr_name', function () {
            $(this).closest('tr').remove();
            _this.getSkuAttr()
            _this.syncData();
        });

        // 绑定input变化事件
        _this.wrap.find('.sku_attr_key_val tbody').on('change', 'input', _this.getSkuAttr.bind(_this));
        _this.wrap.find('.sku_edit_wrap tbody').on('keyup', 'input', _this.processSku.bind(_this));
        _this.wrap.find('.sku_edit_wrap tbody').on('change', 'input[type="radio"]', _this.processSku.bind(_this));
        _this.wrap.find('.sku_edit_wrap tbody').on('change', 'input[type="checkbox"]', _this.processSku.bind(_this));

        // SKU图片上传
        _this.wrap.find('.sku_edit_wrap tbody').on('click', '.Js_sku_upload', function () {
            _this.upload($(this));
        });

        // 删除图片
        _this.wrap.find('.sku_edit_wrap tbody').on('click', '.sku_img .icon-x', function () {
            let that = $(this);
            Dcat.confirm('確定要刪除圖片嗎？', null, function () {
                $.ajax({
                    type: "POST",
                    url: _this.deleteUrl,
                    data: {path: that.data('path')},
                    headers: {
                        Accept: "application/json"
                    },
                    success: function (res) {
                        let method = res.code == 200 ? 'success' : 'error';
                        Dcat[method](res.message);
                        if (res.code == 200) {
                            // 补全剩余上传按钮
                            var dataType = that.data('type');
                            if (dataType === 'en') {
                                that.parent().after('<span class="Js_sku_upload" style="margin-left: 2px;" title="英文圖片" data-type="en"><i class="feather icon-upload-cloud"></i></span>');
                            } else {
                                that.parent().before('<span class="Js_sku_upload" title="繁體圖片" data-type="hk"><i class="feather icon-upload-cloud"></i></span>');
                            }

                            that.parent('div').remove();
                            _this.processSku();
                        }
                    }
                })
            });

            return false;
        });

        _this.wrap.find('.sku_edit_wrap tbody').on('mouseenter', '.sku_img img', function () {
            $(this).next('.icon-x').show();
        });

        _this.wrap.find('.sku_edit_wrap tbody').on('mouseleave', '.sku_img img', function () {
            $(this).next('.icon-x').hide();
        });

        let old_val = _this.wrap.find('.Js_sku_input').val();
        let params = _this.wrap.find('.Js_sku_params_input').val();
        if (old_val) {
            // 根据值生成DOM
            old_val = JSON.parse(old_val);
            // 处理规格名
            let attr_names = old_val.attrs;
            let tbody = _this.wrap.find('.sku_attr_key_val tbody');
            let attr_keys = Object.keys(attr_names);
            let attr_keys_len = attr_keys.length;

            for (var show_name in attr_names) {
                if (attr_names[show_name].show_pic) {
                    _this.showPicName= show_name;
                }
            }

            attr_keys.forEach(function (attr_key1) {
                let sku = _this.skuAttributes.filter((res) => {
                    return res.attr_name == attr_key1;
                });
                if (sku.length > 0 && !_this.selectAttr.includes(sku[0].id)) {
                    _this.selectAttr.push(sku[0].id);
                }
            });

            attr_keys.forEach(function (attr_key, index) {
                // 规格名
                let tr = tbody.find('tr').eq(index);
                let scopeAttrType = '';
                let sku = _this.skuAttributes.filter((res) => {
                    return res.attr_name == attr_key;
                });
                if (sku.length > 0) {
                    scopeAttrType = sku[0].attr_type;
                }
                switch (scopeAttrType) {
                    case 'checkbox':
                    case 'radio':
                        _this.currentAttributeValue = attr_names[attr_key];
                        _this.currentSkuId = sku[0].id;
                        let attributeHtml = _this.getAttributeHtml(scopeAttrType, sku[0]);
                        let html = _this.getHtml(attributeHtml);
                        if (index === 0) {
                            _this.wrap.find('.sku_attr_key_val tbody').html(html);
                            _this.wrap.find('.sku_attr_key_val tbody').find('tr').eq(0).find('td:last-child').html('<span class="btn btn-primary Js_add_attr_name">添加</span>');

                            // 重新绑定添加事件
                            _this.wrap.find('.Js_add_attr_name').off('click').on('click', function () {
                                _this.wrap.find('.sku_attr_key_val tbody').append(_this.getHtml());
                            });
                        } else {
                            _this.wrap.find('.sku_attr_key_val tbody').append(html);
                        }

                        break;
                    default:
                        tr.find('td:eq(0) input').val(attr_key);
                        // 规格值
                        let attr_val_td = tr.find('td:eq(1)');
                        let attr_vals = attr_names[attr_key];
                        let attr_vals_len = attr_vals.length;
                        attr_vals.list.forEach(function (attr_val, index_2) {
                            attr_val_td.find('input').eq(index_2).val(attr_val);
                            if (index_2 < attr_vals_len - 1) {
                                attr_val_td.find('.Js_add_attr_val').trigger('click');
                            }
                        });
                        break;
                }
            });

            // 生成具体的SKU配置表单
            _this.attrs = old_val.attrs;
            _this.SKUForm(old_val.sku, JSON.parse(params));
        } else {
            _this.processSku();
        }
    };

    // 获取SKU属性
    SKU.prototype.getSkuAttr = function () {
        let attr = {}; // 所有属性
        let _this = this;
        let trs = _this.wrap.find('.sku_attr_key_val tbody tr');
        trs.each(function () {
            let tr = $(this);
            let attr_val = []; // 属性值
            let scopeAttrType = tr.find('td:eq(0) select:eq(0)').val();
            let scopeAttrName = '';
            switch (scopeAttrType) {
                case 'checkbox':
                case 'radio':
                    scopeAttrName = tr.find('td:eq(0) select:eq(0)').find("option:selected").text();
                    tr.find('td:eq(1) input[type="' + scopeAttrType + '"]:checked').each(function (i, v) {
                        var detailValue = JSON.parse(decodeURIComponent($(v).attr('data-value')));
                        attr_val.push(detailValue);
                    });
                    break;
                default:
                    scopeAttrName = tr.find('td:eq(0) input').val();
                    tr.find('td:eq(1) input').each(function () {
                        let ipt_val = $(this).val();
                        if (ipt_val) {
                            attr_val.push(ipt_val)
                        }
                    });
                    break;
            }
            if (attr_val.length) {
                attr[scopeAttrName] = attr_val;
            }
        });
        if (JSON.stringify(_this.attrs) !== JSON.stringify(attr)) {
            _this.attrs = attr;
            let params = _this.wrap.find('.Js_sku_params_input').val();

            let old_val = _this.wrap.find('.Js_sku_input').val();
            let old_sku = null;
            if (old_val) {
                old_val = JSON.parse(old_val);
                old_sku = old_val.sku;
            }

            _this.SKUForm(old_sku, JSON.parse(params));
        }
    };

    // 生成具体的SKU配置表单
    SKU.prototype.SKUForm = function (default_sku, params) {
        let _this = this;
        let attr_names = Object.keys(_this.attrs);
        if (attr_names.length === 0) {
            _this.wrap.find('.sku_edit_wrap tbody').html(' ');
            _this.wrap.find('.sku_edit_wrap thead').html(' ');
        } else {
            // 渲染表头
            let thead_html = '<tr>';
            attr_names.forEach(function (attr_name) {
                var isChecked = attr_name === _this.showPicName ? 'checked="checked"' : '';
                thead_html += '<th style="width: 100px">' +
                    '<div class="vs-radio-con vs-radio-primary" style="width: fit-content;margin: 0 auto;" title="顯示規格圖片">' +
                    '<input value="0" name="switch-format-image" class="field_sex _normal_ Dcat_Admin_Widgets_Radio" type="radio" ' + isChecked +'>' +
                    '<span class="vs-radio vs-radio-">' +
                    '<span class="vs-radio--border"></span>' +
                    '<span class="vs-radio--circle"></span>' +
                    '</span>' +
                    '<span>'+ attr_name +'</span>' +
                    '</div>' +
                    '</th>';
            });
            thead_html += '<th data-field="pic" style="width: 102px">圖片 </th>';
            thead_html += '<th data-field="stock">庫存 <input type="text" class="form-control"></th>';
            thead_html += '<th data-field="price">價格 <input type="text" class="form-control"></th>';

            params.forEach((v) => {
                switch (v.type) {
                    case 'input': {
                        thead_html += '<th data-field="' + v['field'] + '">' + v['name'] + '<input  type="text" class="form-control"></th>';
                        break;
                    }
                    case 'radio': {
                        thead_html += '<th data-field="' + v['field'] + '" style="width: 100px;">' + v['name'] + '</th>';
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });

            thead_html += '</tr>';
            _this.wrap.find('.sku_edit_wrap thead').html(thead_html);

            // 求笛卡尔积
            let cartesianProductOf = (function () {
                return Array.prototype.reduce.call(arguments, function (a, b) {
                    const ret = [];
                    a.forEach(function (a) {
                        var tempB = b;
                        if (typeof b === 'object' && b.hasOwnProperty('list')) {
                            tempB = b.list;
                        }
                        tempB.forEach(function (b) {
                            ret.push(a.concat([b]));
                        });
                    });
                    return ret;
                }, [[]]);
            })(...Object.values(_this.attrs));

            // 根据计算的笛卡尔积渲染tbody
            let tbody_html = '';
            var loopIndex = 0;
            cartesianProductOf.forEach(function (sku_item) {
                tbody_html += '<tr>';
                sku_item.forEach(function (attr_val, index) {
                    tbody_html += '<td data-field="' + attr_val.id + '" class="attr-name">' + attr_val.value + '</td>';
                });
                tbody_html += '<td data-field="pic"><div class="sku_img"><span class="Js_sku_upload" title="繁體圖片" data-type="hk"><i class="feather icon-upload-cloud"></i></span><span class="Js_sku_upload" style="margin-left: 2px;" title="英文圖片" data-type="en"><i class="feather icon-upload-cloud"></i></span></div></td>';
                tbody_html += '<td data-field="stock">' +
                    '<div class="vs-checkbox-con vs-checkbox-primary" style="float: left;margin-top: 14px;" title="限制庫存">' +
                    '<input value="1" class="Dcat_Admin_Widgets_Checkbox" type="checkbox" name="" checked>' +
                    '<span class="vs-checkbox">' +
                    '<span class="vs-checkbox--check">' +
                    '<i class="vs-icon feather icon-check"></i>' +
                    '</span>' +
                    '</span>' +
                    '</div>' +
                    '<input value="" type="text" class="form-control" style="width: calc(100% - 30px);">' +
                    '</td>';
                tbody_html += '<td data-field="price"><input value="" type="text" class="form-control"></td>';

                params.forEach((v) => {
                    switch (v.type) {
                        case 'input': {
                            tbody_html += '<td data-field="' + v['field'] + '"><input value="' + v['default'] + '" type="text" class="form-control"></td>';
                            break;
                        }
                        case 'radio': {
                            var isChecked = loopIndex === 0 ? 'checked="checked"' : '';
                            tbody_html += '<td data-field="' + v['field'] + '">' +
                                '<div class="vs-radio-con vs-radio-primary" style="width: fit-content;margin: 15px auto 0;" title="'+ v['name'] +'">' +
                                '<input value="0" name="'+ v['field'] +'" class="field_sex _normal_ Dcat_Admin_Widgets_Radio" type="radio" '+ isChecked +'>' +
                                '<span class="vs-radio vs-radio-">' +
                                '<span class="vs-radio--border"></span>' +
                                '<span class="vs-radio--circle"></span>' +
                                '</span>' +
                                '</div>' +
                                '</td>';
                            loopIndex += 1;
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                })
                tbody_html += '</tr>'
            });
            _this.wrap.find('.sku_edit_wrap tbody').html(tbody_html);
            if (default_sku) {
                // 填充数据
                default_sku.forEach(function (item_sku, index) {
                    var trLen = _this.wrap.find('.sku_edit_wrap tbody tr');
                    var trIndex = -1;
                    for (var i = 0; i < trLen.length; i++) {
                        var filedNameFiled = $(trLen[i]).find('td.attr-name');
                        var filedNameValue = [];
                        var fieldMatch = true;
                        for (var j = 0; j < filedNameFiled.length; j++) {
                            var filedOne = $(trLen[i]).find('td.attr-name').eq(j).attr('data-field');
                            filedNameValue.push(filedOne);
                        }

                        for (var k = 0; k < filedNameValue.length; k++) {
                            if (!item_sku.values.includes(filedNameValue[k])) {
                                fieldMatch = false;
                            }
                        }
                        if (fieldMatch) {
                            trIndex = i;
                        }
                    }

                    if (trIndex >= 0) {
                        let tr = _this.wrap.find('.sku_edit_wrap tbody tr').eq(trIndex);
                        var uploadEle = tr.find('.Js_sku_upload');
                        if (uploadEle.length > 1) {
                            uploadEle = $(uploadEle[0]);
                        }
                        Object.keys(item_sku).forEach(function (field, indexNumber) {
                            if (field === 'pic' && item_sku[field].length > 0) {
                                item_sku[field].forEach(function (v) {
                                    if (v.type === 'hk') {
                                        uploadEle.before('<div class="img"><img src="' + v.full_url + '"/><i class="feather icon-x" data-path="' + v.short_url + '" data-type="'+ v.type +'"></i></div>');
                                    } else {
                                        uploadEle.after('<div class="img"><img src="' + v.full_url + '"/><i class="feather icon-x" data-path="' + v.short_url + '" data-type="'+ v.type +'"></i></div>');
                                    }
                                });
                                item_sku[field].forEach(function (v) {
                                    // 需要移除之前的上传框
                                    tr.find('.Js_sku_upload[data-type="'+ v.type +'"]').remove();
                                });
                            } else if (field === 'stock') {
                                var stockLimit1 = tr.find('td[data-field="' + field + '"] input[type="checkbox"]');
                                var stockNum1 = tr.find('td[data-field="' + field + '"] input[type="text"]');
                                // 是否选中

                                if (item_sku.stock_limit) {
                                    stockLimit1.attr('checked', 'checked');
                                    stockNum1.removeAttr('readonly').val(item_sku[field]);
                                } else {
                                    stockLimit1.removeAttr('checked');
                                    stockNum1.attr('readonly', 'readonly').val('');
                                }
                            } else if (field === 'is_default') {
                                if (!item_sku[field]) {
                                    tr.find('td[data-field="' + field + '"] input[type="radio"]').removeAttr('checked');
                                } else {
                                    tr.find('td[data-field="' + field + '"] input[type="radio"]').attr('checked', 'checked');
                                }
                            } else {
                                let input = tr.find('td[data-field="' + field + '"] input');
                                if (input.length) {
                                    input.val(item_sku[field]);
                                }
                            }
                        })
                    }
                });
            }
        }
        _this.processSku()
        _this.setListener()
    };


    SKU.prototype.setListener = function () {
        let _this = this
        let ths = _this.wrap.find('.sku_edit_wrap thead th')
        let tr = _this.wrap.find('.sku_edit_wrap tbody tr')
        let tds = tr.find('td[data-field]')

        ths.each(function () {
            let th = $(this)
            let input = th.find('input')
            input.change(function () {
                let value = input.val()
                let field = th.attr('data-field')
                // 找出所有带这个attr的下级
                tds.each(function () {
                    let td = $(this)
                    let tdField = td.attr('data-field')
                    let tdInput = td.find('input')
                    if (tdInput && field === tdField) {
                        tdInput.val(value);
                    }
                })
                _this.processSku()
            })
        });
    };

    // 处理最终SKU数据，并写入input
    SKU.prototype.processSku = function () {
        let _this = this;
        let sku_json = {};
        sku_json.type = _this.wrap.find('.sku_attr_select .btn.btn-success').attr('data-type');

        var switchShowPic = $('input[name="switch-format-image"]');
        var showAttrs = Object.values(_this.attrs);
        sku_json.attrs = [];
        for (var x = 0; x < showAttrs.length;x++) {
            var currentSwitchItem = $(switchShowPic[x]);
            var isSwitch = 0;
            if (currentSwitchItem.length && currentSwitchItem.is(':checked')) {
                isSwitch = 1;
            }
            var itemShowAttr = showAttrs[x];
            if (typeof itemShowAttr === 'object' && itemShowAttr.hasOwnProperty('list')) {
                itemShowAttr = itemShowAttr.list;
            }
            sku_json.attrs.push({show_pic: isSwitch, list: itemShowAttr});
        }

        // 多规格
        let sku = [];
        _this.wrap.find('.sku_edit_wrap tbody tr').each(function () {
            let tr = $(this);
            let item_sku = {};
            tr.find('td[data-field]').each(function () {
                let pic = [];
                let td = $(this);
                let field = td.attr('data-field');
                if (field == 'pic') {
                    let skuImg = td.find('.img');
                    if (skuImg.length > 0) {
                        skuImg.each(function (i, v) {
                            pic.push({
                                short_url: $(v).find('.icon-x').data('path'),
                                full_url: $(v).find('img').attr('src'),
                                type: $(v).find('i').attr('data-type')
                            });
                        });
                        item_sku['pic'] = pic;
                    }
                } else {
                    if (item_sku.values === undefined) {
                        item_sku.values = [];
                    }
                    if (td.hasClass('attr-name')) {
                        item_sku.values.push(field)
                    }

                    if (field === 'stock') {
                        var stockLimit = td.find('input[type="checkbox"]');
                        var stockNum = td.find('input[type="text"]');

                        if  (stockLimit.is(':checked')) {
                            stockNum.removeAttr('readonly');
                            item_sku[field] = stockNum.val();
                            item_sku['stock_limit'] = 1;
                        } else {
                            stockNum.attr('readonly', 'readonly').val('');
                            item_sku[field] = '';
                            item_sku['stock_limit'] = 0;
                        }

                    } else {
                        var currentInput = td.find('input');
                        switch (currentInput.attr('type')) {
                            case 'text': {
                                item_sku[field] = currentInput.val() || td.text();
                                break;
                            }
                            case 'radio': {
                                item_sku[field] = currentInput.is(':checked');
                                break;
                            }
                            default: {
                                item_sku[field] = td.text();
                                break;
                            }
                        }
                    }
                }
            });
            sku.push(item_sku);
        });
        sku_json.sku = sku;
        _this.wrap.find('.Js_sku_input').val(JSON.stringify(sku_json));
    };

    // 图片上传
    SKU.prototype.upload = function (obj) {
        let _this = this;
        // 创建input[type="file"]元素
        let file_input = document.createElement('input');
        file_input.setAttribute('type', 'file');
        file_input.setAttribute('accept', 'image/x-png,image/jpeg');

        // 模拟点击 选择文件
        file_input.click();

        file_input.onchange = function () {
            let file = file_input.files[0];  //获取上传的文件名
            let formData = new FormData();
            formData.append('file', file);
            // 使用ajax上传文件
            $.ajax({
                type: "POST",
                url: _this.uploadUrl,
                data: formData,
                contentType: false, //告诉jQuery不要去设置Content-Type请求头
                headers: {
                    Accept: "application/json"
                },
                processData: false, //告诉jQuery不要去处理发送的数据
                success: function (res) {
                    var dataType = obj.attr('data-type');
                    obj.before('<div class="img"><img src="' + res.full_url + '"/><i class="feather icon-x" data-path="' + res.short_url + '" data-type="'+ dataType +'"></i></div>');
                    obj.remove();
                    _this.processSku();
                }
            })
        }
    };

    SKU.prototype.changeAttrValueHtml = function (e, attrType) {
        let _this = this;
        let html = this.getAttributeHtml(attrType, this.skuAttr);
        if (!attrType) {
            var trLen = $(e).closest('tr').parent().find('tr');

            if (trLen.length > 1) {
                $(e).closest('tr').remove();
                _this.getSkuAttr()
            } else {
                e.parent().next('td').find('.sku_attr_val_wrap').html('');
                $('.sku_edit_wrap').html('<table class="table table-bordered"><thead> </thead><tbody></tbody></table>')
            }

            // 当前是否是带添加按钮的像
            var isAdd = $(e).closest('tr').find('td:last-child').find('.Js_add_attr_name');
            if (isAdd.length) {
                if (trLen.length >= 2) {
                    trLen.eq(1).find('td:last-child').html('<span class="btn btn-primary Js_add_attr_name">添加</span>');

                    // 重新绑定添加事件
                    _this.wrap.find('.Js_add_attr_name').off('click').on('click', function () {
                        _this.wrap.find('.sku_attr_key_val tbody').append(_this.getHtml());
                    });
                }
            }

        } else {
            e.parent().next('td').find('.sku_attr_val_wrap').html(html);
            var selectList = $('select.attribute_selector');

            _this.selectAttr = [];
            for (var x = 0; x < selectList.length; x++) {
                var currentSelect = $(selectList[x]).find('option:selected').attr('data-idx');
                if (currentSelect === undefined || currentSelect === 'undefined') {
                    continue;
                }
                _this.selectAttr.push(_this.skuAttributes[currentSelect].id)
            }

            for (var b = 0; b < selectList.length; b++) {
                var currentVal = $(selectList[b]).find('option:selected').attr('data-idx');
                var allOption = $(selectList[b]).find('option');
                for (var c = 0; c < allOption.length; c++) {
                    var currentIdx = $(allOption[c]).attr('data-idx');
                    if (currentIdx === undefined || currentIdx === 'undefined') {
                        continue;
                    }
                    var currentSkuId = _this.skuAttributes[currentIdx].id;
                    if (_this.selectAttr.includes(currentSkuId) && currentIdx !== currentVal) {
                        $(allOption[c]).attr('disabled', 'disabled');
                    } else {
                        $(allOption[c]).removeAttr('disabled');
                    }
                }
            }
        }

        _this.syncData();
    };

    SKU.prototype.syncData = function () {
        var _this = this;
        // 已有的选择项进行select修改
        var selectAttr = [];
        var selectList = $('.sku_attr_key_val').find('select');
        for (var i = 0; i < selectList.length; i++) {
            // 当前选择的值
            var dataIndex = $(selectList[i]).find('option:selected').attr('data-idx');
            if (dataIndex >= 0) {
                dataIndex = parseInt(dataIndex);
                selectAttr.push(_this.skuAttributes[dataIndex].id);
            }
        }
        _this.selectAttr = selectAttr;
        _this.getSkuAttr();
    };


    SKU.prototype.getAttributeHtml = function (attrType, attribute) {
        let _this = this;
        let html = '';
        switch (attrType) {
            case 'checkbox':
                if (attribute.attr_value.length > 0) {
                    html += '<div class="d-flex flex-wrap">';
                    attribute.attr_value.forEach(function (v) {
                        var vDetail = encodeURIComponent(JSON.stringify(v));
                        html += '<div class="vs-checkbox-con vs-checkbox-primary" style="margin-right: 16px"><input value="' + v.id + '" class="Dcat_Admin_Widgets_Checkbox" type="checkbox" name="' + v.value + '" data-value="'+ vDetail +'"';
                        var currentAttributeValue = _this.currentAttributeValue;
                        if (typeof currentAttributeValue === 'object' && currentAttributeValue.hasOwnProperty('list')) {
                            currentAttributeValue = currentAttributeValue.list;
                            currentAttributeValue = currentAttributeValue.map(item => item.id);
                        }

                        if (currentAttributeValue.includes(v.id)) {
                            html += ' checked="checked"';
                        }
                        html += '><span class="vs-checkbox">' +
                            '<span class="vs-checkbox--check">' +
                            '<i class="vs-icon feather icon-check"></i>' +
                            '</span>' +
                            '</span>' +
                            '<span>' + v.value + '</span>' +
                            '</div>'
                    });
                    html += '</div>';
                }
                break;
            case 'radio':
                if (attribute.attr_value.length > 0) {
                    html += '<div class="d-flex flex-wrap">';
                    attribute.attr_value.forEach(function (v) {
                        var vDetail = encodeURIComponent(JSON.stringify(v));
                        html += '<div class="vs-radio-con vs-radio-primary" style="margin-right: 16px">' +
                            '<input value="' + v.id + '" class="Dcat_Admin_Widgets_Radio" type="radio" name="' + v.value + '" data-value="'+ vDetail +'"';

                        var currentAttributeValue = _this.currentAttributeValue;
                        if (typeof currentAttributeValue === 'object' && currentAttributeValue.hasOwnProperty('list')) {
                            currentAttributeValue = currentAttributeValue.list;
                            currentAttributeValue = currentAttributeValue.map(item => item.id);
                        }

                        if (currentAttributeValue.indexOf(v) >= 0) {
                            html += ' checked="checked"';
                        }
                        html += '><span class="vs-radio">' +
                            '<span class="vs-radio--border"></span>' +
                            '<span class="vs-radio--circle"></span>' +
                            '</span>' +
                            '<span>' + v.value + '</span>' +
                            '</div>';
                    });
                    html += '</div>';
                }
                break;
            default:
                html = '<div class="sku_attr_val_item">' +
                    '<div class="sku_attr_val_input">' +
                    '<input type="text" class="form-control">' +
                    '</div>' +
                    '<span class="btn btn-default Js_remove_attr_val"><i class="feather icon-x"></i></span>' +
                    '</div>' +
                    '<div class="sku_attr_val_item Js_add_attr_val" style="padding-left:10px">' +
                    '<span class="btn btn-primary"><i class="feather icon-plus"></i></span>' +
                    '</div>';
                break;
        }

        return html;
    };

    SKU.prototype.getHtml = function (innerHtml = '') {
        let _this = this;
        let skuAttributesArray = this.skuAttributes;
        let html = '<tr><td><select class="form-control  attribute_selector"';
        if (innerHtml.length > 0 && _this.currentSkuId == '') {
            html += ' selected="selected"';
        }
        html += '><option value="">請選擇規格...</option>';
        skuAttributesArray.forEach(function (v, i) {
            var isDisabled = _this.selectAttr.includes(v.id) && v.id !== _this.currentSkuId ? 'disabled="disabled"' : ''
            html += ' <option value="' + v.attr_type + '" data-idx="' + i + '" '+ isDisabled +'';
            if (innerHtml.length > 0 && v.id == _this.currentSkuId) {
                html += ' selected="selected"';
            }
            html += '>' + v.attr_name + '</option>'
        });
        html += '</select></td><td><div class="sku_attr_val_wrap">'+ (innerHtml.length > 0 ? innerHtml : '') +'</div></td><td><span class="btn btn-default Js_remove_attr_name">移除</span></td></tr>';

        return html;
    };

    window.JadeKunSKU = SKU;
})();
