# NASADEM Batch Export Usage Guide
# NASADEM批量导出使用指南

This guide provides detailed instructions for using the NASADEM batch export script to download elevation data for China using Google Earth Engine.

本指南提供了使用NASADEM批量导出脚本通过Google Earth Engine下载中国高程数据的详细说明。

## Table of Contents / 目录

1. [Prerequisites / 前提条件](#prerequisites--前提条件)
2. [Quick Start / 快速开始](#quick-start--快速开始)
3. [Configuration / 配置](#configuration--配置)
4. [Usage Examples / 使用示例](#usage-examples--使用示例)
5. [Monitoring Exports / 监控导出](#monitoring-exports--监控导出)
6. [Troubleshooting / 故障排除](#troubleshooting--故障排除)
7. [Advanced Usage / 高级用法](#advanced-usage--高级用法)

## Prerequisites / 前提条件

### Required Access / 必需权限
- Google Earth Engine account with access to:
  - `projects/ee-otato/assets/china_shp/grid_1deg_overlap01` FeatureCollection
  - `NASA/NASADEM_HGT/001` dataset
- Google Drive account for export storage

- Google Earth Engine账户，需要访问：
  - `projects/ee-otato/assets/china_shp/grid_1deg_overlap01` 要素集合
  - `NASA/NASADEM_HGT/001` 数据集
- 用于导出存储的Google Drive账户

### Data Sources Information / 数据源信息

#### Grid FeatureCollection / 网格要素集合
- **Asset Path**: `projects/ee-otato/assets/china_shp/grid_1deg_overlap01`
- **Coverage**: China mainland with 1°×1° grid cells
- **Overlap**: 0.1° overlap between adjacent cells
- **Key Attribute**: `tile_id` - Used for file naming

#### NASADEM Dataset / NASADEM数据集
- **Dataset**: `NASA/NASADEM_HGT/001`
- **Resolution**: ~30m
- **Coverage**: Near-global (56°S to 60°N)
- **Units**: Elevation in meters above sea level

## Quick Start / 快速开始

### Step 1: Load the Script / 步骤1：加载脚本

1. Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Copy the entire content of `nasadem_batch_export.js`
3. Paste it into a new script in the Code Editor

1. 打开[Google Earth Engine代码编辑器](https://code.earthengine.google.com/)
2. 复制`nasadem_batch_export.js`的全部内容
3. 将其粘贴到代码编辑器的新脚本中

### Step 2: Preview the Grid / 步骤2：预览网格

```javascript
// Uncomment this line to preview the grid
previewGrid();
```

This will:
- Load and visualize the China grid on the map
- Validate the grid collection
- Print grid information to the console

这将：
- 在地图上加载并可视化中国网格
- 验证网格集合
- 在控制台打印网格信息

### Step 3: Test Run / 步骤3：测试运行

```javascript
// Uncomment this line for a test run
testRun();
```

This performs a dry run (no actual export) with the first 5 tiles to verify everything works correctly.

这将执行测试运行（不实际导出），使用前5个瓦片来验证一切正常工作。

### Step 4: Full Export / 步骤4：完整导出

```javascript
// Uncomment this line for full batch export
main();
```

This starts the complete batch export process for all grid tiles.

这将启动所有网格瓦片的完整批量导出过程。

## Configuration / 配置

The script behavior can be customized by modifying the `CONFIG` object:

可以通过修改`CONFIG`对象来自定义脚本行为：

### Basic Settings / 基本设置

```javascript
var CONFIG = {
  // Data sources / 数据源
  GRID_COLLECTION: 'projects/ee-otato/assets/china_shp/grid_1deg_overlap01',
  NASADEM_DATASET: 'NASA/NASADEM_HGT/001',
  
  // Export settings / 导出设置
  RESOLUTION: 30,           // Resolution in meters
  CRS: 'EPSG:4326',        // Coordinate reference system
  FILE_FORMAT: 'GeoTIFF',  // Export format
  
  // Export folder / 导出文件夹
  DRIVE_FOLDER: 'NASADEM_China_Export',
};
```

### Batch Processing Settings / 批处理设置

```javascript
// Batch processing / 批处理设置
BATCH_SIZE: 50,          // Maximum exports per batch
MAX_PIXELS: 1e9,         // Maximum pixels per export

// Processing options / 处理选项
SPECIFIC_TILES: [],      // Process only specific tile IDs
START_INDEX: 0,          // Starting index for processing
END_INDEX: -1,           // Ending index (-1 = all)
```

### Debug and Testing / 调试和测试

```javascript
// Debugging / 调试设置
DEBUG: true,             // Enable detailed logging
DRY_RUN: false          // Test run without actual export
```

## Usage Examples / 使用示例

### Example 1: Preview Grid / 示例1：预览网格

```javascript
// Load and visualize the grid
previewGrid();
```

**Expected Output:**
- Grid visualization on the map
- Console output with grid validation results
- Total number of grid cells

### Example 2: Test Run / 示例2：测试运行

```javascript
// Test with first 5 tiles
testRun();
```

**Expected Output:**
- Processing logs for 5 tiles
- No actual exports (dry run mode)
- Validation of export parameters

### Example 3: Export Specific Tiles / 示例3：导出特定瓦片

```javascript
// Export only specific tiles
exportSpecificTiles(['tile_001', 'tile_002', 'tile_003']);
```

**Use Case:** When you need data for specific regions only.

### Example 4: Export Tile Range / 示例4：导出瓦片范围

```javascript
// Export tiles 10-20
exportTileRange(10, 20);
```

**Use Case:** For incremental processing or testing with a subset.

### Example 5: Full Batch Export / 示例5：完整批量导出

```javascript
// Export all tiles
main();
```

**Use Case:** Complete dataset download for entire China.

### Example 6: Custom Configuration / 示例6：自定义配置

```javascript
// Modify configuration for specific needs
CONFIG.RESOLUTION = 90;           // Lower resolution for faster processing
CONFIG.BATCH_SIZE = 20;           // Smaller batches to avoid quota limits
CONFIG.DRIVE_FOLDER = 'MyExports'; // Custom folder name
CONFIG.DEBUG = false;             // Disable verbose logging

// Run with custom settings
main();
```

## Monitoring Exports / 监控导出

### Check Export Progress / 检查导出进度

1. **Tasks Tab**: Click the "Tasks" tab in the Code Editor
2. **Status Monitoring**: Watch for:
   - `READY`: Task is queued
   - `RUNNING`: Export in progress
   - `COMPLETED`: Export finished successfully
   - `FAILED`: Export failed (check error message)

1. **任务选项卡**：点击代码编辑器中的"任务"选项卡
2. **状态监控**：观察：
   - `READY`：任务已排队
   - `RUNNING`：导出进行中
   - `COMPLETED`：导出成功完成
   - `FAILED`：导出失败（检查错误消息）

### Console Output / 控制台输出

The script provides detailed logging:

脚本提供详细的日志记录：

```
[2025-09-01T12:00:00.000Z] [INFO] Starting NASADEM batch export for China
[2025-09-01T12:00:01.000Z] [INFO] Loading grid collection: projects/ee-otato/assets/china_shp/grid_1deg_overlap01
[2025-09-01T12:00:02.000Z] [INFO] Grid validation - Total features: 450
[2025-09-01T12:00:03.000Z] [INFO] Processing batch 1 (features 0-49)
[2025-09-01T12:00:04.000Z] [INFO] Export task submitted: NASADEM_China_tile_001
```

### Google Drive Output / Google Drive输出

Exported files will appear in your Google Drive under the specified folder:

导出的文件将出现在您的Google Drive的指定文件夹中：

```
Google Drive/
└── NASADEM_China_Export/
    ├── NASADEM_China_tile_001.tif
    ├── NASADEM_China_tile_002.tif
    ├── NASADEM_China_tile_003.tif
    └── ...
```

## Troubleshooting / 故障排除

### Common Issues / 常见问题

#### 1. Access Denied to Grid Collection / 网格集合访问被拒绝

**Error:** `Collection 'projects/ee-otato/assets/china_shp/grid_1deg_overlap01' not found`

**Solution:** 
- Verify you have access to the asset
- Contact the asset owner for permissions
- Check if the asset path is correct

#### 2. Export Quota Exceeded / 导出配额超出

**Error:** `Export quota exceeded`

**Solution:**
- Reduce `BATCH_SIZE` in configuration
- Wait for current exports to complete
- Process in smaller chunks using `exportTileRange()`

#### 3. Memory Limit Exceeded / 内存限制超出

**Error:** `Computation timed out` or `Memory limit exceeded`

**Solution:**
- Reduce `MAX_PIXELS` value
- Increase `RESOLUTION` (lower detail)
- Process smaller batches

#### 4. Invalid Tile ID / 无效瓦片ID

**Error:** `Property 'tile_id' not found`

**Solution:**
- Run `previewGrid()` to check grid properties
- Verify the grid collection has `tile_id` attribute
- Check grid collection integrity

### Debug Mode / 调试模式

Enable detailed logging for troubleshooting:

启用详细日志记录进行故障排除：

```javascript
CONFIG.DEBUG = true;
CONFIG.DRY_RUN = true;  // Test without actual export
```

## Advanced Usage / 高级用法

### Custom File Naming / 自定义文件命名

Modify the `createExportTask()` function for custom naming:

修改`createExportTask()`函数进行自定义命名：

```javascript
// Custom naming pattern
var fileName = ee.String('NASADEM_30m_').cat(ee.String(tileId)).cat('_EPSG4326');
```

### Different Export Destinations / 不同导出目标

#### Export to Google Cloud Storage / 导出到Google Cloud Storage

```javascript
Export.image.toCloudStorage({
  image: clippedImage,
  description: fileName.getInfo(),
  bucket: 'your-bucket-name',
  fileNamePrefix: fileName.getInfo(),
  scale: CONFIG.RESOLUTION,
  crs: CONFIG.CRS,
  maxPixels: CONFIG.MAX_PIXELS,
  region: geometry
});
```

#### Export to Asset / 导出为资产

```javascript
Export.image.toAsset({
  image: clippedImage,
  description: fileName.getInfo(),
  assetId: 'users/your-username/nasadem-exports/' + fileName.getInfo(),
  scale: CONFIG.RESOLUTION,
  crs: CONFIG.CRS,
  maxPixels: CONFIG.MAX_PIXELS,
  region: geometry
});
```

### Processing with Different Datasets / 使用不同数据集处理

Replace NASADEM with other elevation datasets:

用其他高程数据集替换NASADEM：

```javascript
// SRTM Digital Elevation Model
NASADEM_DATASET: 'USGS/SRTMGL1_003'

// ASTER Global Digital Elevation Model
NASADEM_DATASET: 'ASTER/GDEM/ASTGTM002'

// Copernicus DEM
NASADEM_DATASET: 'COPERNICUS/DEM/GLO30'
```

### Parallel Processing / 并行处理

For very large datasets, consider splitting the work:

对于非常大的数据集，考虑分割工作：

```javascript
// Process different regions in parallel
// Region 1: Northern China
exportTileRange(0, 150);

// Region 2: Central China  
exportTileRange(150, 300);

// Region 3: Southern China
exportTileRange(300, 450);
```

### Quality Control / 质量控制

Add validation steps:

添加验证步骤：

```javascript
// Check if export region is valid
var bounds = geometry.bounds();
var area = bounds.area();
if (area.gt(1e11)) {  // ~100,000 km²
  logMessage('Warning: Large export area detected for ' + tileId, 'WARN');
}
```

## Best Practices / 最佳实践

### 1. Start Small / 从小开始
- Always run `testRun()` first
- Export a few tiles to verify output quality
- Check file sizes and processing times

### 2. Monitor Resources / 监控资源
- Keep track of Google Drive storage space
- Monitor Earth Engine quotas
- Use appropriate batch sizes

### 3. Organize Outputs / 组织输出
- Use descriptive folder names
- Include metadata in filenames
- Document export parameters

### 4. Error Recovery / 错误恢复
- Keep logs of completed exports
- Implement resume functionality for failed batches
- Regular backup of export configurations

## Support / 支持

For issues or questions:
- Check the troubleshooting section above
- Review Google Earth Engine documentation
- Contact the script maintainer

如有问题或疑问：
- 查看上面的故障排除部分
- 查阅Google Earth Engine文档
- 联系脚本维护者

---

**Author:** UCASPotato  
**Date:** 2025-09-01  
**Version:** 1.0