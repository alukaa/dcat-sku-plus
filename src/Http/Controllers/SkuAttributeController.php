<?php

namespace Dcat\Admin\Extension\DcatSkuPlus\Http\Controllers;

use Dcat\Admin\Extension\DcatSkuPlus\Http\Repositories\SkuAttribute;
use Dcat\Admin\Form;
use Dcat\Admin\Grid;
use Dcat\Admin\Http\Controllers\AdminController;
use Dcat\Admin\Layout\Content;

class SkuAttributeController extends AdminController
{
    private $attrType = [
        'checkbox' => '復選框',
        'radio' => '單選框',
    ];

    /**
     * Index interface.
     *
     * @param  Content  $content
     *
     * @return Content
     */
    public function index(Content $content)
    {
        return $content
            ->title('屬性列表')
            ->body($this->grid());
    }

    /**
     * Make a grid builder.
     *
     * @return Grid
     */
    protected function grid()
    {
        return Grid::make(new SkuAttribute(), function (Grid $grid) {
            $grid->id->sortable();
            $grid->column('show_name', '後台名稱');
            $grid->column('attr_name_hk', '屬性名稱-繁體');
            $grid->column('attr_name_en', '屬性名稱-英文');
            $grid->column('attr_type', '屬性類型')
                ->using($this->attrType)
                ->label([
                    'checkbox' => 'info',
                    'radio' => 'primary'
                ]);

            $grid->column('valueInfoHk', '屬性值-繁體')->display(function () {
                return $this->valueInfo->sortBy('sort')->pluck('value_hk')->toArray();
            })->label();
            $grid->column('valueInfoEn', '屬性值-英文')->display(function () {
                return $this->valueInfo->sortBy('sort')->pluck('value_en')->toArray();
            })->label();
            $grid->column('sort', '排序');


            $grid->disableViewButton();

            $grid->quickSearch('attr_name_hk')->placeholder('輸入規格名稱繁體搜索...');

        });
    }

    /**
     * Edit interface.
     *
     * @param  mixed  $id
     * @param  Content  $content
     *
     * @return Content
     */
    public function edit($id, Content $content)
    {
        return $content
            ->title('編輯屬性')
            ->body($this->form()->edit($id));
    }

    /**
     * Make a form builder.
     *
     * @return Form
     */
    protected function form()
    {
        $builder = SkuAttribute::with('valueInfo');
        return Form::make($builder, function (Form $form) {
            $form->display('id');
            $form->text('show_name', '後台名稱')->required()->help('當存在兩個相同的屬性名稱，不同的屬性類型時用作區分，僅在後台展示');
            $form->text('attr_name_hk', '屬性名稱-繁體')->required();
            $form->text('attr_name_en', '屬性名稱-英文')->required();
            $form->radio('attr_type', '屬性類型')->options($this->attrType)->required();
            $form->number('sort', '排序')->default(0)->min(0)->max(100);

            $form->hasMany('valueInfo', '屬性值', function (Form\NestedForm $form) {
                $form->column(1, function (Form\NestedForm $form) {
                });
                $form->column(3, function (Form\NestedForm $form) {
                    $form->text('value_hk', '屬性值-繁體')->required();
                });
                $form->column(3, function (Form\NestedForm $form) {
                    $form->text('value_en', '屬性值-英文')->required();
                });
                $form->column(3, function (Form\NestedForm $form) {
                    $form->number('sort', '排序')->required();
                });
                $form->width(8, 4);
            });


            $form->disableViewButton();
            $form->disableViewCheck();
        });
    }

    /**
     * Create interface.
     *
     * @param  Content  $content
     *
     * @return Content
     */
    public function create(Content $content)
    {
        return $content
            ->title('添加屬性')
            ->body($this->form());
    }
}
