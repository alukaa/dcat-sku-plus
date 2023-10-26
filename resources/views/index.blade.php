
<div class="{{$viewClass['form-group']}}">

    <label for="{{$id ?? ''}}" class="{{$viewClass['label']}} control-label"><i class="feather icon-help-circle goods-format-tip"></i>{{$label}}</label>

    <div class="{{$viewClass['field']}}">
        <div class="sku_wrap {{$class}}">
            <input type="hidden" class="Js_sku_input" name="{{$name}}" value='@json($sku)'>
            <input type="hidden" class="Js_sku_params_input" value="{{$extra_column}}">
            <input type="hidden" class="upload_url" value="{{$uploadUrl}}">
            <input type="hidden" class="delete_url" value="{{$deleteUrl}}">
            <input type="hidden" class="sku_attributes" value='@json($skuAttributes)'>
            <input type="hidden" class="_csrf_token" value="{{csrf_token()}}">
            <div class="sku_attr_key_val">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th style="width: 200px">規格名</th>
                        <th>規格值</th>
                        <th style="width: 100px">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                            <select class="form-control _normal_ attribute_selector">
                                <option value="">請選擇規格</option>
                                @foreach($skuAttributes as $key => $attribute)
                                    <option value="{{$attribute['attr_type']}}" data-idx="{{$key}}">{{$attribute['attr_name']}}</option>
                                @endforeach
                            </select>
                        </td>
                        <td>
                            <div class="sku_attr_val_wrap">
                            </div>
                        </td>
                        <td>
                            <span class="btn btn-primary Js_add_attr_name">添加</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- 操作SKU -->
            <div class="sku_edit_wrap">
                <table class="table table-bordered">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

    </div>
</div>

<style>
    .sku_wrap .sku_edit_wrap .Js_sku_del_pic {
        color: {{ Admin::color()->get('cyan') }};
    }

    .sku_wrap .sku_edit_wrap .Js_sku_upload {
        border: 1px solid {{ Admin::color()->get('input-border') }};
        color: {{ Admin::color()->get('dark70') }};
    }

    .sku_wrap .sku_edit_wrap tr td .icon-x {
        color: {{ Admin::color()->get('danger') }};
    }

    .sku_wrap .flex-wrap {
        margin-top: 7px;
    }

</style>
