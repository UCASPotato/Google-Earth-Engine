/**
 * NASADEM Batch Export Script for China
 * 中国地区NASADEM高程数据批量导出脚本
 * 
 * Author: UCASPotato
 * Date: 2025-09-01
 * 
 * This script exports NASADEM elevation data for China using an existing 1°×1° grid FeatureCollection.
 * 该脚本使用现有的1°×1°网格要素集合导出中国地区的NASADEM高程数据。
 */

// =============================================================================
// CONFIGURATION SECTION / 配置部分
// =============================================================================

var CONFIG = {
  // Data sources / 数据源
  GRID_COLLECTION: 'projects/ee-otato/assets/china_shp/grid_1deg_overlap01',
  NASADEM_DATASET: 'NASA/NASADEM_HGT/001',
  
  // Export settings / 导出设置
  RESOLUTION: 30,           // Resolution in meters / 分辨率（米）
  CRS: 'EPSG:4326',        // Coordinate reference system / 坐标参考系统
  FILE_FORMAT: 'GeoTIFF',  // Export format / 导出格式
  
  // Batch processing / 批处理设置
  BATCH_SIZE: 50,          // Maximum number of exports in one batch / 单批次最大导出数量
  MAX_PIXELS: 1e9,         // Maximum pixels per export / 每次导出最大像素数
  
  // Export folder / 导出文件夹
  DRIVE_FOLDER: 'NASADEM_China_Export',
  
  // Processing options / 处理选项
  SPECIFIC_TILES: [],      // Array of specific tile_ids to process / 指定处理的瓦片ID数组
  START_INDEX: 0,          // Starting index for processing / 处理起始索引
  END_INDEX: -1,           // Ending index for processing (-1 for all) / 处理结束索引（-1表示全部）
  
  // Debugging / 调试设置
  DEBUG: true,             // Enable debug logging / 启用调试日志
  DRY_RUN: false          // Test run without actual export / 测试运行，不实际导出
};

// =============================================================================
// HELPER FUNCTIONS / 辅助函数
// =============================================================================

/**
 * Log messages with timestamp / 带时间戳的日志消息
 * @param {string} message - Message to log / 要记录的消息
 * @param {string} level - Log level (INFO, WARN, ERROR) / 日志级别
 */
function logMessage(message, level) {
  level = level || 'INFO';
  var timestamp = new Date().toISOString();
  print('[' + timestamp + '] [' + level + '] ' + message);
}

/**
 * Validate grid FeatureCollection / 验证网格要素集合
 * @param {ee.FeatureCollection} gridCollection - Grid collection to validate / 要验证的网格集合
 * @return {Object} Validation result / 验证结果
 */
function validateGridCollection(gridCollection) {
  try {
    var count = gridCollection.size();
    var first = ee.Feature(gridCollection.first());
    var properties = first.propertyNames();
    
    logMessage('Grid validation - Total features: ' + count.getInfo(), 'INFO');
    logMessage('Grid validation - Properties: ' + properties.getInfo().join(', '), 'INFO');
    
    // Check if tile_id property exists / 检查tile_id属性是否存在
    var hasTileId = properties.contains('tile_id');
    
    return {
      isValid: hasTileId.getInfo(),
      count: count.getInfo(),
      properties: properties.getInfo(),
      hasTileId: hasTileId.getInfo()
    };
  } catch (error) {
    logMessage('Grid validation failed: ' + error.message, 'ERROR');
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Get features to process based on configuration / 根据配置获取要处理的要素
 * @param {ee.FeatureCollection} gridCollection - Full grid collection / 完整网格集合
 * @return {ee.FeatureCollection} Filtered collection / 过滤后的集合
 */
function getFeaturesToProcess(gridCollection) {
  var features = gridCollection;
  
  // Filter by specific tile IDs if provided / 如果提供了特定瓦片ID则进行过滤
  if (CONFIG.SPECIFIC_TILES.length > 0) {
    features = features.filter(ee.Filter.inList('tile_id', CONFIG.SPECIFIC_TILES));
    logMessage('Filtering by specific tiles: ' + CONFIG.SPECIFIC_TILES.join(', '), 'INFO');
  }
  
  // Apply index range if specified / 如果指定了索引范围则应用
  if (CONFIG.START_INDEX > 0 || CONFIG.END_INDEX >= 0) {
    var endIdx = CONFIG.END_INDEX >= 0 ? CONFIG.END_INDEX : features.size();
    var indexRange = ee.List.sequence(CONFIG.START_INDEX, endIdx.subtract(1));
    var featureList = features.toList(features.size());
    features = ee.FeatureCollection(indexRange.map(function(index) {
      return featureList.get(index);
    }));
    logMessage('Processing index range: ' + CONFIG.START_INDEX + ' to ' + endIdx.getInfo(), 'INFO');
  }
  
  return features;
}

/**
 * Create export task for a single grid cell / 为单个网格单元创建导出任务
 * @param {ee.Feature} gridFeature - Grid feature to process / 要处理的网格要素
 * @param {ee.Image} nasademImage - NASADEM image / NASADEM影像
 * @return {Object} Export task configuration / 导出任务配置
 */
function createExportTask(gridFeature, nasademImage) {
  try {
    // Get tile ID for naming / 获取瓦片ID用于命名
    var tileId = gridFeature.get('tile_id');
    var fileName = ee.String('NASADEM_China_').cat(ee.String(tileId));
    
    // Get geometry for clipping / 获取几何体用于裁剪
    var geometry = gridFeature.geometry();
    
    // Clip NASADEM to grid cell / 将NASADEM裁剪到网格单元
    var clippedImage = nasademImage.clip(geometry);
    
    // Create export task / 创建导出任务
    var exportTask = {
      image: clippedImage,
      description: fileName.getInfo(),
      folder: CONFIG.DRIVE_FOLDER,
      fileNamePrefix: fileName.getInfo(),
      scale: CONFIG.RESOLUTION,
      crs: CONFIG.CRS,
      maxPixels: CONFIG.MAX_PIXELS,
      region: geometry,
      fileFormat: CONFIG.FILE_FORMAT
    };
    
    return exportTask;
  } catch (error) {
    logMessage('Error creating export task for tile ' + gridFeature.get('tile_id').getInfo() + ': ' + error.message, 'ERROR');
    return null;
  }
}

/**
 * Execute export task / 执行导出任务
 * @param {Object} exportTask - Export task configuration / 导出任务配置
 */
function executeExportTask(exportTask) {
  if (!exportTask) return;
  
  try {
    if (CONFIG.DRY_RUN) {
      logMessage('DRY RUN - Would export: ' + exportTask.description, 'INFO');
    } else {
      Export.image.toDrive(exportTask);
      logMessage('Export task submitted: ' + exportTask.description, 'INFO');
    }
  } catch (error) {
    logMessage('Error submitting export task ' + exportTask.description + ': ' + error.message, 'ERROR');
  }
}

/**
 * Process features in batches / 批量处理要素
 * @param {ee.FeatureCollection} features - Features to process / 要处理的要素
 * @param {ee.Image} nasademImage - NASADEM image / NASADEM影像
 */
function processFeaturesInBatches(features, nasademImage) {
  var featureList = features.toList(features.size());
  var totalFeatures = features.size().getInfo();
  var processedCount = 0;
  
  logMessage('Starting batch processing of ' + totalFeatures + ' features', 'INFO');
  
  // Process in batches / 分批处理
  for (var i = 0; i < totalFeatures; i += CONFIG.BATCH_SIZE) {
    var endIndex = Math.min(i + CONFIG.BATCH_SIZE, totalFeatures);
    var batchSize = endIndex - i;
    
    logMessage('Processing batch ' + Math.floor(i / CONFIG.BATCH_SIZE + 1) + 
               ' (features ' + i + '-' + (endIndex - 1) + ')', 'INFO');
    
    // Process each feature in the batch / 处理批次中的每个要素
    for (var j = i; j < endIndex; j++) {
      var feature = ee.Feature(featureList.get(j));
      var tileId = feature.get('tile_id').getInfo();
      
      if (CONFIG.DEBUG) {
        logMessage('Processing tile: ' + tileId + ' (' + (j + 1) + '/' + totalFeatures + ')', 'INFO');
      }
      
      var exportTask = createExportTask(feature, nasademImage);
      if (exportTask) {
        executeExportTask(exportTask);
        processedCount++;
      }
    }
    
    // Add delay between batches to avoid quota issues / 批次间添加延迟以避免配额问题
    if (i + CONFIG.BATCH_SIZE < totalFeatures && !CONFIG.DRY_RUN) {
      logMessage('Waiting before next batch to avoid quota limits...', 'INFO');
      // Note: In GEE, actual delays would need to be implemented differently
      // 注意：在GEE中，实际延迟需要以不同方式实现
    }
  }
  
  logMessage('Batch processing completed. Processed: ' + processedCount + '/' + totalFeatures + ' tiles', 'INFO');
}

// =============================================================================
// MAIN PROCESSING FUNCTIONS / 主处理函数
// =============================================================================

/**
 * Main function to execute the batch export / 执行批量导出的主函数
 */
function main() {
  logMessage('Starting NASADEM batch export for China', 'INFO');
  logMessage('开始中国地区NASADEM批量导出', 'INFO');
  
  try {
    // Load data sources / 加载数据源
    logMessage('Loading grid collection: ' + CONFIG.GRID_COLLECTION, 'INFO');
    var gridCollection = ee.FeatureCollection(CONFIG.GRID_COLLECTION);
    
    logMessage('Loading NASADEM dataset: ' + CONFIG.NASADEM_DATASET, 'INFO');
    var nasademImage = ee.Image(CONFIG.NASADEM_DATASET);
    
    // Validate grid collection / 验证网格集合
    logMessage('Validating grid collection...', 'INFO');
    var validation = validateGridCollection(gridCollection);
    
    if (!validation.isValid) {
      logMessage('Grid collection validation failed: ' + (validation.error || 'Missing tile_id property'), 'ERROR');
      return;
    }
    
    logMessage('Grid collection validated successfully. Total features: ' + validation.count, 'INFO');
    
    // Get features to process / 获取要处理的要素
    var featuresToProcess = getFeaturesToProcess(gridCollection);
    var processCount = featuresToProcess.size().getInfo();
    
    if (processCount === 0) {
      logMessage('No features to process based on current configuration', 'WARN');
      return;
    }
    
    logMessage('Features to process: ' + processCount, 'INFO');
    
    // Display configuration / 显示配置
    logMessage('Export configuration:', 'INFO');
    logMessage('  Resolution: ' + CONFIG.RESOLUTION + 'm', 'INFO');
    logMessage('  CRS: ' + CONFIG.CRS, 'INFO');
    logMessage('  Format: ' + CONFIG.FILE_FORMAT, 'INFO');
    logMessage('  Drive folder: ' + CONFIG.DRIVE_FOLDER, 'INFO');
    logMessage('  Batch size: ' + CONFIG.BATCH_SIZE, 'INFO');
    logMessage('  Dry run: ' + CONFIG.DRY_RUN, 'INFO');
    
    // Process features / 处理要素
    processFeaturesInBatches(featuresToProcess, nasademImage);
    
    logMessage('NASADEM batch export process completed', 'INFO');
    logMessage('NASADEM批量导出处理完成', 'INFO');
    
    if (!CONFIG.DRY_RUN) {
      logMessage('Check the Tasks tab to monitor export progress', 'INFO');
      logMessage('请检查任务选项卡以监控导出进度', 'INFO');
    }
    
  } catch (error) {
    logMessage('Error in main process: ' + error.message, 'ERROR');
    logMessage('主处理过程出错: ' + error.message, 'ERROR');
  }
}

// =============================================================================
// UTILITY FUNCTIONS FOR SPECIFIC USE CASES / 特定用例的实用函数
// =============================================================================

/**
 * Export specific tiles by tile IDs / 根据瓦片ID导出特定瓦片
 * @param {Array} tileIds - Array of tile IDs to export / 要导出的瓦片ID数组
 */
function exportSpecificTiles(tileIds) {
  logMessage('Starting export for specific tiles: ' + tileIds.join(', '), 'INFO');
  
  // Update configuration / 更新配置
  CONFIG.SPECIFIC_TILES = tileIds;
  CONFIG.START_INDEX = 0;
  CONFIG.END_INDEX = -1;
  
  // Run main process / 运行主程序
  main();
}

/**
 * Export tiles in a specific index range / 导出指定索引范围内的瓦片
 * @param {number} startIndex - Starting index / 起始索引
 * @param {number} endIndex - Ending index / 结束索引
 */
function exportTileRange(startIndex, endIndex) {
  logMessage('Starting export for tile range: ' + startIndex + ' to ' + endIndex, 'INFO');
  
  // Update configuration / 更新配置
  CONFIG.SPECIFIC_TILES = [];
  CONFIG.START_INDEX = startIndex;
  CONFIG.END_INDEX = endIndex;
  
  // Run main process / 运行主程序
  main();
}

/**
 * Test run without actual export / 测试运行，不实际导出
 */
function testRun() {
  logMessage('Starting test run (dry run mode)', 'INFO');
  
  // Enable dry run / 启用测试模式
  CONFIG.DRY_RUN = true;
  CONFIG.DEBUG = true;
  
  // Process only first 5 tiles for testing / 仅处理前5个瓦片进行测试
  CONFIG.START_INDEX = 0;
  CONFIG.END_INDEX = 5;
  
  // Run main process / 运行主程序
  main();
}

/**
 * Quick preview of grid collection / 网格集合快速预览
 */
function previewGrid() {
  try {
    var gridCollection = ee.FeatureCollection(CONFIG.GRID_COLLECTION);
    
    // Add grid to map for visualization / 将网格添加到地图进行可视化
    Map.addLayer(gridCollection, {color: 'red'}, 'China Grid 1°×1°');
    Map.centerObject(gridCollection, 4);
    
    // Print grid information / 打印网格信息
    var validation = validateGridCollection(gridCollection);
    logMessage('Grid preview loaded. Check the map for visualization.', 'INFO');
    
  } catch (error) {
    logMessage('Error loading grid preview: ' + error.message, 'ERROR');
  }
}

// =============================================================================
// EXECUTION SECTION / 执行部分
// =============================================================================

// Uncomment the function you want to execute / 取消注释您要执行的函数
// 注意：在GEE Code Editor中，您需要取消注释下面其中一行来执行相应功能

// Full batch export / 完整批量导出
// main();

// Test run (dry run) / 测试运行
// testRun();

// Preview grid / 预览网格
// previewGrid();

// Export specific tiles / 导出特定瓦片
// exportSpecificTiles(['tile_001', 'tile_002', 'tile_003']);

// Export tile range / 导出瓦片范围
// exportTileRange(0, 10);

// =============================================================================
// EXAMPLE USAGE / 使用示例
// =============================================================================

/*
BASIC USAGE / 基本用法:
1. Copy this script to Google Earth Engine Code Editor
   将此脚本复制到Google Earth Engine代码编辑器

2. Uncomment main() to run full batch export
   取消注释main()来运行完整批量导出
   
3. Or use other functions for specific needs:
   或使用其他函数满足特定需求：
   
   - testRun(): Test without actual export / 测试而不实际导出
   - previewGrid(): Visualize the grid / 可视化网格
   - exportSpecificTiles(): Export only specific tiles / 仅导出特定瓦片
   - exportTileRange(): Export a range of tiles / 导出瓦片范围

CONFIGURATION / 配置:
- Modify CONFIG object at the top to adjust settings
  修改顶部的CONFIG对象来调整设置
- Set BATCH_SIZE to control export batch size
  设置BATCH_SIZE来控制导出批次大小
- Use DRY_RUN = true for testing
  使用DRY_RUN = true进行测试

MONITORING / 监控:
- Check the Tasks tab in GEE for export progress
  在GEE中检查任务选项卡查看导出进度
- Enable DEBUG for detailed logging
  启用DEBUG获取详细日志
*/

// Default execution for easy testing / 默认执行以便于测试
previewGrid();