// controllers/Advertisement/advertisementController.js

// GET - Get ads for specific page
const getPageAds = async (req, res) => {
  try {
    const { page } = req.query;
    
    console.log(`🟡 [GET PAGE ADS] Request for page: ${page}`);
    
    if (!page) {
      return res.status(400).json({
        success: false,
        message: "❌ Page parameter is required. Example: ?page=home"
      });
    }

    const [result] = await global.db.query(
      `SELECT * FROM Advertisement WHERE page_name = ?`,
      [page]
    );

    if (result.length === 0) {
      console.log(`ℹ️ No ads found for page: ${page}`);
      return res.status(404).json({
        success: false,
        message: `No ads found for page: ${page}`
      });
    }

    // Parse JSON arrays
    const adData = result[0];
    
    let images = [];
    let youtube_urls = [];
    
    try {
      if (adData.images && typeof adData.images === 'string') {
        images = JSON.parse(adData.images);
      } else if (Array.isArray(adData.images)) {
        images = adData.images;
      }
      
      if (adData.youtube_urls && typeof adData.youtube_urls === 'string') {
        youtube_urls = JSON.parse(adData.youtube_urls);
      } else if (Array.isArray(adData.youtube_urls)) {
        youtube_urls = adData.youtube_urls;
      }
    } catch (parseError) {
      console.error("❌ Error parsing JSON data:", parseError);
      images = [];
      youtube_urls = [];
    }

    const responseData = {
      id: adData.id,
      page_name: adData.page_name,
      images: images,
      youtube_urls: youtube_urls,
      createdAt: adData.createdAt,
      updatedAt: adData.updatedAt
    };

    console.log(`✅ Found ads for page: ${page}`);
    console.log(`   Images: ${images.length}, Videos: ${youtube_urls.length}`);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("❌ Error in getPageAds:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// POST/PUT - Create or Update page ads
const updatePageAds = async (req, res) => {
  try {
    const { page_name, images, youtube_urls } = req.body;

    console.log(`🟡 [UPDATE PAGE ADS] Request for page: ${page_name}`);
    console.log(`   Images: ${images?.length || 0}, Videos: ${youtube_urls?.length || 0}`);

    if (!page_name) {
      return res.status(400).json({
        success: false,
        message: "❌ Page name is required"
      });
    }

    // Validate arrays
    const imagesArray = Array.isArray(images) ? images : [];
    const youtubeArray = Array.isArray(youtube_urls) ? youtube_urls : [];

    // Check if page already exists
    const [existing] = await global.db.query(
      `SELECT id FROM Advertisement WHERE page_name = ?`,
      [page_name]
    );

    if (existing.length > 0) {
      // UPDATE existing record
      await global.db.query(
        `UPDATE Advertisement 
         SET images = ?, youtube_urls = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE page_name = ?`,
        [
          JSON.stringify(imagesArray),
          JSON.stringify(youtubeArray),
          page_name
        ]
      );
      
      console.log(`✅ Updated ads for page: ${page_name}`);
      
      return res.status(200).json({
        success: true,
        message: `Ads updated successfully for page: ${page_name}`
      });
    } else {
      // INSERT new record
      const [result] = await global.db.query(
        `INSERT INTO Advertisement (page_name, images, youtube_urls) 
         VALUES (?, ?, ?)`,
        [
          page_name,
          JSON.stringify(imagesArray),
          JSON.stringify(youtubeArray)
        ]
      );

      console.log(`✅ Created new ads for page: ${page_name}, ID: ${result.insertId}`);
      
      return res.status(201).json({
        success: true,
        message: `Ads created successfully for page: ${page_name}`,
        data: { id: result.insertId }
      });
    }
  } catch (error) {
    console.error("❌ Error in updatePageAds:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// GET - Get all pages (Admin)
const getAllPages = async (req, res) => {
  try {
    console.log("🟡 [GET ALL PAGES] Request received");
    
    const [pages] = await global.db.query(
      `SELECT * FROM Advertisement ORDER BY page_name`
    );

    // Parse JSON arrays for each page
    const parsedPages = pages.map(page => {
      let images = [];
      let youtube_urls = [];
      
      try {
        if (page.images && typeof page.images === 'string') {
          images = JSON.parse(page.images);
        } else if (Array.isArray(page.images)) {
          images = page.images;
        }
        
        if (page.youtube_urls && typeof page.youtube_urls === 'string') {
          youtube_urls = JSON.parse(page.youtube_urls);
        } else if (Array.isArray(page.youtube_urls)) {
          youtube_urls = page.youtube_urls;
        }
      } catch (parseError) {
        console.error(`❌ Error parsing data for page ${page.page_name}:`, parseError);
      }

      return {
        id: page.id,
        page_name: page.page_name,
        images: images,
        youtube_urls: youtube_urls,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      };
    });

    console.log(`✅ Returned ${parsedPages.length} pages`);
    
    res.status(200).json({
      success: true,
      count: parsedPages.length,
      data: parsedPages
    });
  } catch (error) {
    console.error("❌ Error in getAllPages:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// POST - Add sample data for testing
const addSampleData = async (req, res) => {
  try {
    console.log("🟡 [ADD SAMPLE DATA] Request received");
    
    const samplePages = [
      {
        page_name: 'home',
        images: [
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'
        ],
        youtube_urls: [
          'https://www.youtube.com/embed/qYapc_bkfxw',
          'https://www.youtube.com/embed/dQw4w9WgXcQ'
        ]
      },
      {
        page_name: 'colleges',
        images: [
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94'
        ],
        youtube_urls: [
          'https://www.youtube.com/embed/LjCzPp-MK48'
        ]
      },
      {
        page_name: 'schools',
        images: [
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1'
        ],
        youtube_urls: [
          'https://www.youtube.com/embed/0J2QdDbelmY',
          'https://www.youtube.com/embed/sFXGrTng0gQ'
        ]
      },
      {
        page_name: 'tuitions',
        images: [
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94'
        ],
        youtube_urls: [
          'https://www.youtube.com/embed/hHW1oY26kxQ'
        ]
      }
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const page of samplePages) {
      // Check if page exists
      const [existing] = await global.db.query(
        `SELECT id FROM Advertisement WHERE page_name = ?`,
        [page.page_name]
      );

      if (existing.length > 0) {
        // Update existing
        await global.db.query(
          `UPDATE Advertisement 
           SET images = ?, youtube_urls = ?, updatedAt = CURRENT_TIMESTAMP 
           WHERE page_name = ?`,
          [
            JSON.stringify(page.images),
            JSON.stringify(page.youtube_urls),
            page.page_name
          ]
        );
        updatedCount++;
      } else {
        // Insert new
        await global.db.query(
          `INSERT INTO Advertisement (page_name, images, youtube_urls) 
           VALUES (?, ?, ?)`,
          [
            page.page_name,
            JSON.stringify(page.images),
            JSON.stringify(page.youtube_urls)
          ]
        );
        addedCount++;
      }
    }

    console.log(`✅ Sample data added: ${addedCount} added, ${updatedCount} updated`);
    
    res.status(200).json({
      success: true,
      message: `Sample data added successfully. Added: ${addedCount}, Updated: ${updatedCount}`,
      data: {
        added: addedCount,
        updated: updatedCount,
        total: samplePages.length
      }
    });
  } catch (error) {
    console.error("❌ Error in addSampleData:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// DELETE - Delete page ads
const deletePageAds = async (req, res) => {
  try {
    const { page_name } = req.params;
    
    console.log(`🟡 [DELETE PAGE ADS] Request for page: ${page_name}`);
    
    const [result] = await global.db.query(
      `DELETE FROM Advertisement WHERE page_name = ?`,
      [page_name]
    );

    if (result.affectedRows === 0) {
      console.log(`ℹ️ Page not found: ${page_name}`);
      return res.status(404).json({
        success: false,
        message: `Page "${page_name}" not found`
      });
    }

    console.log(`✅ Deleted ads for page: ${page_name}`);
    
    res.status(200).json({
      success: true,
      message: `Ads deleted successfully for page: ${page_name}`
    });
  } catch (error) {
    console.error("❌ Error in deletePageAds:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// GET - Test endpoint
const testEndpoint = (req, res) => {
  console.log("🟡 [TEST ENDPOINT] Advertisement API is working");
  res.status(200).json({
    success: true,
    message: "Advertisement API is working!",
    endpoints: {
      "GET /": "Get ads for a page (query: ?page=home)",
      "POST /": "Create/update page ads",
      "PUT /": "Create/update page ads",
      "GET /all": "Get all pages (admin)",
      "POST /sample": "Add sample data",
      "DELETE /:page_name": "Delete page ads",
      "GET /test": "Test endpoint"
    },
    table_name: "Advertisement"
  });
};

// Export all functions
module.exports = {
  getPageAds,
  updatePageAds,
  getAllPages,
  addSampleData,
  deletePageAds,
  testEndpoint
};