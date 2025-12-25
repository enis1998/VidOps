package com.vidops.user.user.service;

import com.vidops.user.user.repository.UserRepository;
import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;
import com.vidops.user.user.exception.DuplicateEmailException;
import com.vidops.user.user.exception.UserNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserProfile create(UserProfile user) {
        userRepository.findByEmail(user.getEmail()).ifPresent(u -> { throw new DuplicateEmailException(user.getEmail()); });
        return userRepository.save(user);
    }

    @Override
    public UserProfile get(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    public UserProfile update(UUID id, String fullName, Plan plan, Integer credits) {
        UserProfile user = get(id);

        if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
        if (plan != null) user.setPlan(plan);
        if (credits != null) user.setCredits(credits);

        return userRepository.save(user);
    }

    @Override
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) throw new UserNotFoundException(id);
        userRepository.deleteById(id);
    }
}
