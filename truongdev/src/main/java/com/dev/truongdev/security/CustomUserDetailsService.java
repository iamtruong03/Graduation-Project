package com.dev.truongdev.security;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String code) throws UsernameNotFoundException {
        User user = userRepo.findByCode(code)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with code: " + code));

        return new org.springframework.security.core.userdetails.User(
                user.getCode(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
        );
    }
}