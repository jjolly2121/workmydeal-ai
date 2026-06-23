package com.workmydeal.backend.dto;

public class ImportResult {

    private int imported;
    private int skipped;
    private int errors;

    public ImportResult(int imported, int skipped, int errors) {
        this.imported = imported;
        this.skipped = skipped;
        this.errors = errors;
    }

    public int getImported() {
        return imported;
    }

    public int getSkipped() {
        return skipped;
    }

    public int getErrors() {
        return errors;
    }
}