<?php

namespace Dcat\Admin\Extension\DcatSkuPlus\Models;

use App\Models\LocalizedModel;
use Dcat\Admin\Traits\HasDateTimeFormatter;
use Illuminate\Database\Eloquent\Model;

class SkuValue extends LocalizedModel
{
    use HasDateTimeFormatter;

    public $table = 'jx_goods_sku_value';

    protected $localizable = ['value'];

    protected $guarded = ['id'];

    public static function getByAttrId(array $attrIds)
    {
        return self::whereIn('attr_id', $attrIds)->get();
    }
}
