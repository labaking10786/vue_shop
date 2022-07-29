<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>增加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="增加商品訊息" type="info" center show-icon :closable="false"></el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本訊息"></el-step>
        <el-step title="商品參數"></el-step>
        <el-step title="商品屬性"></el-step>
        <el-step title="商品圖片"></el-step>
        <el-step title="商品內容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本訊息" name="0">
            <el-form-item label="商品名稱" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品價格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品數量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分類" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                    expandTrigger: 'hover',
                    label:'cat_name',
                    value:'cat_id',
                    children:'children'
                  }"
                @change="handleChange"
                clearable
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品參數" name="1">
            <el-form-item :label="item.attr_name" v-for="item of manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) of item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品屬性" name="2">
            <el-form-item :label="item.attr_name" v-for="item of onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品圖片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSucces"
            >
              <el-button size="small" type="primary">點擊上傳</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品內容" name="4">
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">增加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog
      title="圖片預覽"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '請輸入商品名稱', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '請輸入商品價格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '請輸入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '請輸入商品數量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '請輸入商品分類', trigger: 'blur' }
        ]
      },
      cateList: [],
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://192.168.103.119:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false

    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('取商品分類失敗')
      this.cateList = res.data
    },
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('請先選擇商品分類')
        return false
      }
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('取商品分類失敗')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('取商品屬性失敗')
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
      console.log(this.previewPath)
    },
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    handleSucces (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    async add () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error('請填寫必要的表單項')
      })
      // 複製addForm
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')

      this.manyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })

      this.onlyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })

      form.attrs = this.addForm.attrs
      const { data: res } = await this.$http.post('goods', form)
      if (res.meta.status !== 201) return this.$message.error('增加商品失敗')
      this.$message.success('增加商品成功')
      this.$router.push('/goods')
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}

.previewImg{
  width: 100%;
}

.btnAdd{
  margin-top: 15px;
}
</style>
