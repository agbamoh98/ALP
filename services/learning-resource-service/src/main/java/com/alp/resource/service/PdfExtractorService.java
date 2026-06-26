package com.alp.resource.service;

import com.alp.resource.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Slf4j
public class PdfExtractorService {

    public String extractText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new AppException(
                        "Encrypted PDFs are not supported. Please remove the password and try again.",
                        HttpStatus.UNPROCESSABLE_ENTITY
                );
            }

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document).trim();

            if (text.isBlank()) {
                throw new AppException(
                        "No readable text found in the PDF. It may be a scanned image. OCR support is coming in a future version.",
                        HttpStatus.UNPROCESSABLE_ENTITY
                );
            }

            log.debug("Extracted {} characters from PDF: {}", text.length(), file.getOriginalFilename());
            return text;

        } catch (AppException e) {
            throw e;
        } catch (IOException e) {
            log.error("Failed to parse PDF: {}", e.getMessage());
            throw new AppException("Failed to read the PDF file. Please ensure it is a valid PDF.", HttpStatus.BAD_REQUEST);
        }
    }
}
