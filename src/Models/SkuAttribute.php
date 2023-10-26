<?php

namespace Dcat\Admin\Extension\DcatSkuPlus\Models;

use App\Models\LocalizedModel;
use Dcat\Admin\Traits\HasDateTimeFormatter;
use Illuminate\Database\Eloquent\Model;

class SkuAttribute extends LocalizedModel
{
    use HasDateTimeFormatter;

    public $table = 'jx_goods_sku_attribute';

    protected $localizable = ['attr_name'];

    public function valueInfo()
    {
        return $this->hasMany(SkuValue::class, 'attr_id', 'id');
    }

    public static function getById(array $ids) 
    {
        return self::whereIn('id', $ids)->get();
    }
}
