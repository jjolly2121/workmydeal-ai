package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.Note;
import com.workmydeal.backend.service.NoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals/{dealId}/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<Note> getNotesByDeal(@PathVariable Long dealId) {
        return noteService.getNotesByDeal(dealId);
    }

    @PostMapping
    public Note createNote(@PathVariable Long dealId, @RequestBody Note note) {
        return noteService.createNote(dealId, note);
    }
}
