#!/usr/bin/env python3
"""
PDF Conversion Script for Dental AI Presentation Materials
Converts markdown files and combines with visualizations into professional PDFs
"""

import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """Install required packages for PDF conversion"""
    packages = [
        'markdown',
        'pdfkit',
        'weasyprint',
        'reportlab',
        'Pillow'
    ]
    
    for package in packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])

def convert_markdown_to_pdf():
    """Convert markdown files to PDF using multiple methods"""
    
    # Files to convert
    markdown_files = [
        'FINAL_PRESENTATION_METRICS_REPORT.md',
        'PRESENTATION_METRICS_SUMMARY.md',
        'PRESENTATION.md'
    ]
    
    output_dir = Path('presentation_pdfs')
    output_dir.mkdir(exist_ok=True)
    
    print("🔄 Converting Markdown files to PDF...")
    
    for md_file in markdown_files:
        if os.path.exists(md_file):
            pdf_name = md_file.replace('.md', '.pdf')
            output_path = output_dir / pdf_name
            
            try:
                # Method 1: Using pandoc (if available)
                try:
                    subprocess.run([
                        'pandoc', md_file, 
                        '-o', str(output_path),
                        '--pdf-engine=wkhtmltopdf',
                        '--css=presentation_style.css'
                    ], check=True)
                    print(f"✅ Converted {md_file} to PDF using pandoc")
                    continue
                except (subprocess.CalledProcessError, FileNotFoundError):
                    pass
                
                # Method 2: Using markdown + weasyprint
                try:
                    import markdown
                    from weasyprint import HTML, CSS
                    
                    with open(md_file, 'r', encoding='utf-8') as f:
                        md_content = f.read()
                    
                    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
                    
                    # Add CSS styling
                    styled_html = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                            h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
                            h2 {{ color: #34495e; margin-top: 30px; }}
                            h3 {{ color: #7f8c8d; }}
                            table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
                            th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
                            th {{ background-color: #f2f2f2; font-weight: bold; }}
                            code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }}
                            pre {{ background-color: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }}
                            .metric {{ font-weight: bold; color: #e74c3c; }}
                        </style>
                    </head>
                    <body>
                    {html_content}
                    </body>
                    </html>
                    """
                    
                    HTML(string=styled_html).write_pdf(str(output_path))
                    print(f"✅ Converted {md_file} to PDF using weasyprint")
                    continue
                    
                except ImportError:
                    pass
                
                # Method 3: Simple HTML conversion
                print(f"⚠️ Advanced PDF conversion not available for {md_file}")
                print(f"   Creating HTML version instead...")
                
                import markdown
                with open(md_file, 'r', encoding='utf-8') as f:
                    md_content = f.read()
                
                html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
                html_file = output_dir / md_file.replace('.md', '.html')
                
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Dental AI Presentation</title>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                            h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; }}
                            table {{ border-collapse: collapse; width: 100%; }}
                            th, td {{ border: 1px solid #ddd; padding: 12px; }}
                            th {{ background-color: #f2f2f2; }}
                        </style>
                    </head>
                    <body>
                    {html_content}
                    </body>
                    </html>
                    """)
                
                print(f"✅ Created HTML version: {html_file}")
                
            except Exception as e:
                print(f"❌ Error converting {md_file}: {e}")
        else:
            print(f"⚠️ File not found: {md_file}")

def create_combined_presentation():
    """Create a combined presentation PDF with all materials"""
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        
        output_dir = Path('presentation_pdfs')
        output_dir.mkdir(exist_ok=True)
        
        doc = SimpleDocTemplate(
            str(output_dir / "COMPLETE_DENTAL_AI_PRESENTATION.pdf"),
            pagesize=A4,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=18
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.darkblue,
            alignment=1  # Center alignment
        )
        
        story = []
        
        # Title page
        story.append(Paragraph("🦷 Dental AI Model", title_style))
        story.append(Paragraph("Complete Presentation Package", title_style))
        story.append(Spacer(1, 0.5*inch))
        
        # Key metrics summary
        story.append(Paragraph("📊 Key Performance Metrics", styles['Heading2']))
        metrics_text = """
        • Overall Accuracy: 50.1%
        • IoU (Intersection over Union): 25.0%
        • Dice Coefficient: 42.7%
        • Precision: 39.6%
        • Recall: 50.1%
        • F1-Score: 33.4%
        """
        story.append(Paragraph(metrics_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Model architecture
        story.append(Paragraph("🏗️ Model Architecture", styles['Heading2']))
        arch_text = """
        • Architecture: U-Net with ResNet18 Encoder
        • Framework: PyTorch + segmentation_models_pytorch
        • Input Resolution: 256×256 pixels
        • Output Classes: 2 (Background, Dental Structures)
        • Training: 5 real dental X-ray images with 50x augmentation
        """
        story.append(Paragraph(arch_text, styles['Normal']))
        story.append(PageBreak())
        
        # Add visualizations if they exist
        viz_dir = Path('evaluation_results')
        if viz_dir.exists():
            story.append(Paragraph("📈 Model Performance Visualizations", styles['Heading2']))
            
            viz_files = ['confusion_matrix.png', 'metrics_overview.png', 'classwise_performance.png']
            for viz_file in viz_files:
                viz_path = viz_dir / viz_file
                if viz_path.exists():
                    try:
                        story.append(Paragraph(f"📊 {viz_file.replace('_', ' ').title()}", styles['Heading3']))
                        story.append(Image(str(viz_path), width=6*inch, height=4*inch))
                        story.append(Spacer(1, 0.2*inch))
                    except Exception as e:
                        story.append(Paragraph(f"⚠️ Could not include {viz_file}: {e}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        print(f"✅ Created combined presentation PDF: {output_dir / 'COMPLETE_DENTAL_AI_PRESENTATION.pdf'}")
        
    except ImportError:
        print("⚠️ ReportLab not available for combined PDF creation")
    except Exception as e:
        print(f"❌ Error creating combined PDF: {e}")

def main():
    """Main function to convert all presentation materials to PDF"""
    print("🎯 Converting Dental AI Presentation to PDF Format")
    print("=" * 50)
    
    # Install requirements
    print("📦 Checking and installing requirements...")
    install_requirements()
    
    # Convert markdown files
    convert_markdown_to_pdf()
    
    # Create combined presentation
    create_combined_presentation()
    
    print("\n✅ PDF conversion completed!")
    print("📁 Check the 'presentation_pdfs' folder for your files")
    print("\n📋 Available formats:")
    print("   • Individual PDF files for each report")
    print("   • Combined presentation PDF")
    print("   • HTML versions (if PDF conversion failed)")

if __name__ == "__main__":
    main()