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
        Schema::create('jx_goods_sku_value', function (Blueprint $table) {
            $table->id();
            $table->integer('attr_id')->comment('規格');
            $table->string('value_hk')->comment('規格值-英文');
            $table->string('value_en')->comment('規格值-英文');
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
        Schema::dropIfExists('jx_goods_sku_value');
    }
};
