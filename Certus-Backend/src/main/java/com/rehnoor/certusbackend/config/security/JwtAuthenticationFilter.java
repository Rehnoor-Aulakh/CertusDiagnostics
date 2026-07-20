package com.rehnoor.certusbackend.config.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    CustomUserDetailsService customUserDetailsService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try{
            // 1. Extract the raw JWT token from the incoming HTTP request headeer
            String jwt = getJwtFromRequest(request);

            // 2. If the token exists and is cryptographically valid, process authentication
            if(StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)){

                // 3. Extract the username (email) embedded inside the token
                String email = tokenProvider.getEmailFromJWT(jwt);
                String role = tokenProvider.getRoleFromJWT(jwt);

                // 4. Load the user authorities context (Admin or Patient) from our DB service
                UserDetails userDetails = customUserDetailsService.loadUserByUsernameAndRole(email, role);

                // 5. Create an internal Spring Security Authentication token containing permissions
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set the authentication context globally into the current thread session
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
                logger.error("Could not set user authentication in security context", ex);
            }
        // 7. Pass control down to the next filter in the processing chain
        filterChain.doFilter(request, response);
    }



    // Helper method to parse the 'Authorization: Bearer <token>' schema
    private String getJwtFromRequest(HttpServletRequest request){
        String bearerToken = request.getHeader("Authorization");
        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);    // String away the word "Bearer " and just return the token string
        }
        return null;
    }
}
