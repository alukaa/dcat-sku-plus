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
            $grid->model()->orderByDesc('id');
            $grid->id->sortable();
            $grid->column('attr_name', '熟悉名稱');
            $grid->column('attr_type', '屬性類型')
                ->using($this->attrType)
                ->label([
                    'checkbox' => 'info',
                    'radio' => 'primary'
                ]);
            $grid->column('sort', '排序');
            $grid->column('attr_value', '屬性值')->explode()->label();

            $grid->created_at;
            $grid->updated_at->sortable();

            $grid->disableViewButton();

            $grid->filter(function (Grid\Filter $filter) {
                $filter->equal('id');
                $filter->like('attr_name', '屬性名稱');
                $filter->equal('attr_type', '屬性類型')->select($this->attrType);
            });
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
        return Form::make(new SkuAttribute(), function (Form $form) {
            $form->display('id');
            $form->text('attr_name', '屬性名稱')->required();
            $form->radio('attr_type', '屬性類型')->options($this->attrType)->required();
            $form->list('attr_value', '屬性值');
            $form->number('sort', '排序')->default(0)->min(0)->max(100);

            $form->display('created_at');
            $form->display('updated_at');

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
