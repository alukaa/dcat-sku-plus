<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jx_goods_sku_attribute', function (Blueprint $table) {
            $table->id();
            $table->string('show_name')->comment('後台名稱');
            $table->string('attr_name_hk')->comment('規格名稱-繁體');
            $table->string('attr_name_en')->comment('規格名稱-英文');
            $table->enum('attr_type', ['checkbox', 'radio'])->comment('規格類型');
            $table->tinyInteger('sort')->default(0)->comment('排序');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jx_goods_sku_attribute');
    }
};
