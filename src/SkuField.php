<?php

namespace Dcat\Admin\Extension\DcatSkuPlus;

use Dcat\Admin\Admin;
use Dcat\Admin\Extension\DcatSkuPlus\Models\SkuAttribute;
use Dcat\Admin\Form\Field;

class SkuField extends Field
{
    protected $view = 'dcat-sku-plus::index';

    public function render()
    {
        Admin::js('vendor/dcat-admin-extensions/abbotton/dcat-sku-plus/js/index.js');
        Admin::css('vendor/dcat-admin-extensions/abbotton/dcat-sku-plus/css/index.css');

        $uploadUrl = DcatSkuPlusServiceProvider::setting('sku_plus_img_upload_url') ?: '/admin/sku-image-upload';
        $deleteUrl = DcatSkuPlusServiceProvider::setting('sku_plus_img_remove_url') ?: '/admin/sku-image-remove';
        $attrList = SkuAttribute::with('valueInfo')->orderBy('sort', 'desc')->get();

        $skuAttributes = [];
        foreach ($attrList as $item) {
            $valueList = [];
            foreach ($item->valueInfo as $foo) {
                $valueList[] = [
                    'id'      => $foo->id,
                    'attr_id' => $foo->attr_id,
                    'value'   => $foo->value
                ];
            }
            $skuAttributes[] = [
                'id'         => $item->id,
                'attr_type'  => $item->attr_type,
                'attr_name'  => $item->attr_name,
                'attr_value' => $valueList
            ];
        }

        \Dcat\Admin\Widgets\Tooltip::make('.goods-format-tip')->red()
            ->title('<p>1. 勾選規格名的單選框，並且上傳對應的繁體+英文圖片後。商品頁面對應規格會顯示為圖片</p><p>2. 勾選庫存的復選框後可以輸入對應的規格庫存，不勾選則表示不限制該對應規格的庫存</p><p>3. 勾選默認規格單選框後，商品詳情頁面會默認顯示該規格</p>');

        $this->script = <<< EOF
        window.DemoSku = new JadeKunSKU('{$this->getElementClassSelector()}');
EOF;
        $this->addVariables(compact('skuAttributes', 'uploadUrl', 'deleteUrl'));

        return parent::render();
    }

    /**
     * 添加扩展列.
     *
     * @param  array  $column
     * @return $this
     */
    public function addColumn(array $column = []): self
    {
        $this->addVariables(['extra_column' => json_encode($column)]);

        return $this;
    }
}
