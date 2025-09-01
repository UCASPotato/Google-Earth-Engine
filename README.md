# Google Earth Engine - NASADEM Batch Export
# Google Earth Engine - NASADEM批量导出

A comprehensive Google Earth Engine script for batch exporting NASADEM elevation data for China using an existing 1°×1° grid FeatureCollection.

一个用于使用现有1°×1°网格要素集合批量导出中国地区NASADEM高程数据的综合Google Earth Engine脚本。

## 🌟 Features / 特性

- **Automated Batch Processing** / **自动化批处理**: Export hundreds of grid tiles efficiently
- **Flexible Configuration** / **灵活配置**: Easy parameter adjustment for different use cases  
- **Error Handling** / **错误处理**: Robust error handling and progress tracking
- **Multiple Export Options** / **多种导出选项**: Full batch, specific tiles, or range processing
- **Bilingual Documentation** / **双语文档**: Chinese and English comments and documentation
- **Quality Control** / **质量控制**: Built-in validation and testing functions

## 📋 Quick Start / 快速开始

### Prerequisites / 前提条件
- Google Earth Engine account with access to:
  - `projects/ee-otato/assets/china_shp/grid_1deg_overlap01`
  - `NASA/NASADEM_HGT/001` dataset
- Google Drive account for export storage

### Basic Usage / 基本用法

1. **Copy Script** / **复制脚本**
   ```javascript
   // Copy nasadem_batch_export.js to GEE Code Editor
   // 将nasadem_batch_export.js复制到GEE代码编辑器
   ```

2. **Preview Grid** / **预览网格**
   ```javascript
   previewGrid();  // Visualize the grid on map / 在地图上可视化网格
   ```

3. **Test Run** / **测试运行**
   ```javascript
   testRun();  // Dry run with first 5 tiles / 使用前5个瓦片测试运行
   ```

4. **Full Export** / **完整导出**
   ```javascript
   main();  // Export all tiles / 导出所有瓦片
   ```

## 📁 Project Structure / 项目结构

```
Google-Earth-Engine/
├── nasadem_batch_export.js    # Main GEE script / 主GEE脚本
├── USAGE_GUIDE.md            # Detailed usage guide / 详细使用指南
└── README.md                 # Project overview / 项目概述
```

## 🔧 Configuration / 配置

### Key Parameters / 关键参数

```javascript
var CONFIG = {
  RESOLUTION: 30,                    // Output resolution (meters) / 输出分辨率（米）
  CRS: 'EPSG:4326',                 // Coordinate system / 坐标系统
  BATCH_SIZE: 50,                   // Exports per batch / 每批导出数量
  DRIVE_FOLDER: 'NASADEM_China_Export', // Output folder / 输出文件夹
  DEBUG: true,                      // Enable logging / 启用日志
  DRY_RUN: false                   // Test mode / 测试模式
};
```

## 📊 Data Sources / 数据源

### Grid FeatureCollection / 网格要素集合
- **Path**: `projects/ee-otato/assets/china_shp/grid_1deg_overlap01`
- **Coverage**: China mainland
- **Grid Size**: 1°×1° with 0.1° overlap
- **Naming**: Uses `tile_id` attribute

### NASADEM Dataset / NASADEM数据集
- **Dataset**: `NASA/NASADEM_HGT/001`
- **Resolution**: ~30 meters
- **Format**: Digital Elevation Model
- **Units**: Meters above sea level

## 🚀 Usage Examples / 使用示例

### Export Specific Tiles / 导出特定瓦片
```javascript
exportSpecificTiles(['tile_001', 'tile_002', 'tile_003']);
```

### Export Tile Range / 导出瓦片范围
```javascript
exportTileRange(0, 50);  // Export tiles 0-50 / 导出瓦片0-50
```

### Custom Configuration / 自定义配置
```javascript
CONFIG.RESOLUTION = 90;           // Lower resolution / 较低分辨率
CONFIG.BATCH_SIZE = 20;           // Smaller batches / 较小批次
CONFIG.DRIVE_FOLDER = 'MyExports'; // Custom folder / 自定义文件夹
main();
```

## 📖 Documentation / 文档

- **[USAGE_GUIDE.md](USAGE_GUIDE.md)**: Comprehensive usage guide with examples
- **[nasadem_batch_export.js](nasadem_batch_export.js)**: Well-documented script with inline comments

## 🔍 Monitoring / 监控

### Progress Tracking / 进度跟踪
- Console logging with timestamps / 带时间戳的控制台日志
- Batch processing status / 批处理状态
- Error reporting / 错误报告

### Export Monitoring / 导出监控
- Check GEE Tasks tab / 检查GEE任务选项卡
- Monitor Google Drive storage / 监控Google Drive存储
- Track completion status / 跟踪完成状态

## ⚡ Performance / 性能

### Optimization Features / 优化特性
- Configurable batch sizes / 可配置批次大小
- Memory limit management / 内存限制管理
- Quota-aware processing / 配额感知处理

### Recommended Settings / 推荐设置
- **Small Scale**: `BATCH_SIZE: 10-20`
- **Medium Scale**: `BATCH_SIZE: 30-50` 
- **Large Scale**: `BATCH_SIZE: 50-100`

## 🛠 Troubleshooting / 故障排除

### Common Issues / 常见问题

| Issue / 问题 | Solution / 解决方案 |
|-------------|---------------------|
| Access denied to grid / 网格访问被拒绝 | Verify asset permissions / 验证资产权限 |
| Export quota exceeded / 导出配额超出 | Reduce batch size / 减少批次大小 |
| Memory limit exceeded / 内存限制超出 | Lower resolution or pixels / 降低分辨率或像素 |
| Invalid tile ID / 无效瓦片ID | Check grid collection / 检查网格集合 |

### Debug Mode / 调试模式
```javascript
CONFIG.DEBUG = true;
CONFIG.DRY_RUN = true;  // Test without export / 测试而不导出
```

## 📈 Output / 输出

### File Structure / 文件结构
```
Google Drive/NASADEM_China_Export/
├── NASADEM_China_tile_001.tif
├── NASADEM_China_tile_002.tif
├── NASADEM_China_tile_003.tif
└── ...
```

### File Specifications / 文件规格
- **Format**: GeoTIFF
- **Resolution**: 30m (configurable)
- **CRS**: EPSG:4326
- **Naming**: Based on `tile_id` from grid

## 🤝 Contributing / 贡献

Contributions are welcome! / 欢迎贡献！

1. Fork the repository / 复刻仓库
2. Create feature branch / 创建功能分支
3. Submit pull request / 提交拉取请求

## 📝 License / 许可证

This project is open source and available under standard terms.

## 👤 Author / 作者

**UCASPotato**
- Date / 日期: 2025-09-01
- Contact / 联系: Available through GitHub

## 🔗 Links / 链接

- [Google Earth Engine](https://earthengine.google.com/)
- [NASADEM Documentation](https://developers.google.com/earth-engine/datasets/catalog/NASA_NASADEM_HGT_001)
- [GEE Code Editor](https://code.earthengine.google.com/)

---

## 📋 Checklist / 检查清单

- [x] Main script with all required functionality
- [x] Configuration section for easy parameter adjustment
- [x] Helper functions for validation and progress tracking
- [x] Batch processing with quota management
- [x] Error handling and logging
- [x] Multiple export options (full, specific, range)
- [x] Bilingual comments (Chinese/English)
- [x] Comprehensive documentation
- [x] Usage examples and troubleshooting guide

**Ready to use in Google Earth Engine Code Editor!** / **准备在Google Earth Engine代码编辑器中使用！**
