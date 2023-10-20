<?php

namespace Dcat\Admin\Extension\DcatSkuPlus;

use Dcat\Admin\Extend\Setting as Form;

class Setting extends Form
{
    public function title()
    {
        return 'SKU擴展增強版配置';
    }

    public function form()
    {
        $this->text('sku_plus_img_upload_url', '圖片上傳地址')
            ->default('/admin/sku-image-upload')
            ->help('必須以【/】開頭')
            ->required();

        $this->text('sku_plus_img_remove_url', '圖片刪除地址')
            ->default('/admin/sku-image-remove')
            ->help('必須以【/】開頭')
            ->required();
    }
}
