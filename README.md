# Template Renderer Engine

A powerful and flexible template rendering engine that provides a comprehensive REST API for processing, converting, and rendering templates with support for multiple formats including SVG, PSD, and more. Built with Elysia.js, this service offers advanced image manipulation capabilities and template management features.

## 🚀 Features

### Rendering (Core Feature)

-   **High-Performance Template Rendering**: Convert templates to high-quality images with support for multiple formats
-   **Bulk Processing**: Efficiently render multiple templates in a single request
-   **Real-time Preview**: Instant HTML preview of rendered templates
-   **Base64 Output**: Direct base64 image output for easy integration
-   **Dynamic Content**: Support for variable replacement and dynamic text
-   **Multi-format Support**: Render templates with various content types (SVG, images, text)

### Template Management

-   List all available templates with pagination support
-   Retrieve specific templates by ID
-   Secure endpoint access with API key authentication

### PSD Processing

-   Convert PSD files to templates using URL
-   Dynamic variable replacement in templates
-   Template customization capabilities

### Image Manipulation

-   Smart image resizing with width and height specifications
-   Maintains aspect ratio and image quality
-   Template-aware resizing algorithms

### Template Structure

Templates in this system are JSON-based objects that support a rich set of features:

-   **Layered Structure**: Templates can contain multiple layers including images, text, and SVG elements
-   **Dynamic Text**: Support for text layers with customizable fonts, including Google Fonts integration
-   **Image Processing**: Support for image masking, color replacement, and post-processing
-   **SVG Support**: Native SVG support with color replacement capabilities
-   **Variable Replacement**: Dynamic content replacement through template variables
-   **Font Management**: Automatic font loading and registration from Google Fonts
-   **Image Masking**: Advanced image masking capabilities for complex compositions

### Example Template

Here's a simple example of a template structure:

```json
{
    "width": 800,
    "height": 600,
    "pages": [
        {
            "background": "rgba(255,255,255,1)",
            "children": [
                {
                    "type": "text",
                    "text": "Hello World",
                    "fontFamily": "Arial",
                    "fontSize": 48,
                    "fill": "rgba(0,0,0,1)",
                    "x": 100,
                    "y": 100
                },
                {
                    "type": "image",
                    "src": "https://example.com/image.jpg",
                    "width": 400,
                    "height": 300,
                    "x": 200,
                    "y": 200
                },
                {
                    "type": "svg",
                    "src": "data:image/svg+xml;base64,...",
                    "width": 100,
                    "height": 100,
                    "x": 300,
                    "y": 300
                }
            ]
        }
    ]
}
```

This template demonstrates the basic structure with:

-   Page dimensions and background
-   Text layer with font and position
-   Image layer with dimensions and position
-   SVG layer with dimensions and position

## 🛠️ Technical Stack

-   [Elysia.js](https://elysiajs.com/) - Fast and type-safe Node.js web framework
-   TypeScript - For type-safe code
-   [Konva.js](https://konvajs.org/) - HTML5 Canvas 2D drawing library
-   [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) - High-performance Node.js Canvas implementation
-   [node-canvas](https://github.com/Automattic/node-canvas) - Canvas implementation for Node.js
-   HTML rendering support via @elysiajs/html
-   Built-in pagination utilities
-   Middleware support for authentication and security
-   SVG processing and manipulation
-   Google Fonts integration
-   Image masking and post-processing capabilities

## 📚 API Authentication

The service includes API key authentication middleware for secure access to endpoints (currently commented out in the routes).

## 📚 API Endpoints

### Convert Routes

-   `POST /convert/psd` - Convert PSD file to template
-   `POST /convert/replacement` - Apply variable replacements to template

### Render Routes

-   `POST /render` - Render a template to base64 image
-   `POST /render/preview` - Generate HTML preview of rendered template
-   `POST /render/bulk` - Batch render multiple templates

### Resize Routes

-   `POST /resize` - Resize template with specified dimensions

### Template Routes

-   `GET /templates` - List all templates with pagination
-   `GET /templates/:id` - Get specific template by ID

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
